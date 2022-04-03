defmodule DashboardSkitter.SystemMetrics do
    alias DashboardSkitterWeb.WebUpdates, as: Updates
    use GenServer
  
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

    def calculate_total(mem_detailed) do
        Enum.reduce(mem_detailed, 0, fn({_k, v}, acc) -> v + acc end)
    end

    def handle_cast({:loop}, state) do
        :timer.sleep(1000)
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
            metric: metric, 
            name: state.name,
            detailed_mem: detailed_info
            })
        loop()
        metrics_q = state.metrics
        new_q = add_metric(metrics_q, metric)
        state_detailed_info = Map.put(state, :detailed_mem, detailed_info)
        {:noreply, Map.put(state_detailed_info, :metrics, new_q)}
    end

    def start_loop() do loop() end
    def loop() do GenServer.cast(:system_metrics, {:loop}) end

    def get_state() do 
        nodes = :sys.get_state(:system_metrics)
        Map.put(nodes, :metrics, Tuple.to_list(nodes.metrics))
    end

    def add_metric(state, metric) do
        if :queue.len(state) >= 300 do
            {_, temp_q} = :queue.out(state)
            :queue.in(metric, temp_q)
        else
            :queue.in(metric, state)
        end
    end  
end