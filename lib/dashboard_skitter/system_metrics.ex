defmodule DashboardSkitter.SystemMetrics do
    alias DashboardSkitterWeb.WebUpdates, as: Updates
    use GenServer

    @max_amount_metrics 300
  
    def start_link(start) do
      GenServer.start_link(__MODULE__, start, name: :system_metrics)
    end
  
    def init(start) do
        start_loop()
        {:ok, start}
    end

    def from_bytes_to_mb(bytes) do
        (bytes / (1024 * 1024)) |> Float.round(2)
    end

    def select_mem_info(mem) do
        %{
            Atoms: from_bytes_to_mb(mem[:atom]),
            Binary: from_bytes_to_mb(mem[:binary]),
            Code: from_bytes_to_mb(mem[:code]),
            Ets: from_bytes_to_mb(mem[:ets]),
            Processes: from_bytes_to_mb(mem[:processes]),
            System: from_bytes_to_mb(mem[:system])
        }
    end

    def add_info(metrics, metric, map, node, name, mem) do
        updated_node = Map.merge(node, %{detailed_mem: mem, metrics: add_metric(metrics, metric)})
        {:noreply, Map.put(map,name, updated_node)}
    end

    def calculate_total(mem_detailed) do
        Enum.reduce(mem_detailed, 0, fn({_k, v}, acc) -> v + acc end)
    end

    def handle_cast({:add_metric_remote, bdy}, map) do
        if Enum.member?(Map.keys(map), bdy.name) do
         state_node = map[bdy.name]
         Updates.update_metrics(bdy)
         add_info(state_node.metrics, bdy.metric, map, state_node, bdy.name, bdy.detailed_mem)
        else
         {:noreply, Map.put(map, bdy.name,
                %{
                 metrics: :queue.in(bdy.metric, :queue.new()),
                 detailed_mem: bdy.detailed_mem
                 })
             }
        end
     end

    def handle_cast({:loop}, map) do
        :timer.sleep(1000)
        state_node = map[Skitter.Remote.self()]
        mem = :erlang.memory()
        detailed_info = select_mem_info(mem)
        mem_bytes = calculate_total(detailed_info) |> Float.round(2)
        cpu = Float.round(:cpu_sup.util(), 2)
        metric =%{
            time: DateTime.utc_now() |> DateTime.to_unix(),
            cpu: cpu,
            mem: mem_bytes
        } 
        Updates.update_metrics(%{
            name: Skitter.Remote.self(),
            metric: metric, 
            detailed_mem: detailed_info
            })
        loop()
        if(Skitter.Runtime.mode == :worker) do
            {:noreply, Map.put(%{}, Skitter.Remote.self(),%{})}
        else 
            add_info(state_node.metrics, metric, map, state_node, Skitter.Remote.self(), detailed_info)
        end
    end

    def start_loop() do loop() end
    def loop() do GenServer.cast(:system_metrics, {:loop}) end
    def add_metric_remote(bdy) do GenServer.cast(:system_metrics, {:add_metric_remote, bdy}) end

    def get_state() do 
        :sys.get_state(:system_metrics)
    end

    def add_metric(state_node, metric) do
        if :queue.len(state_node) >= @max_amount_metrics do
            {_, temp_q} = :queue.out(state_node)
            :queue.in(metric, temp_q)
        else
            :queue.in(metric, state_node)
        end
    end  
end