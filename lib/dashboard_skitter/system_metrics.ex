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

    def handle_cast({:loop}, state) do
        :timer.sleep(1000)
        mem_bytes = :erlang.memory(:total); 
        cpu = Float.round(:cpu_sup.util(), 2)
        metric =%{
            time: DateTime.utc_now() |> DateTime.to_unix(),
            cpu: cpu,
            mem: (mem_bytes / (1024 * 1024)) |> Float.round(2)
        } 

        Updates.update_metrics(%{metric: metric, name: state.name})
        loop()
        metrics_q = state.metrics
        new_q = add_metric(metrics_q, metric)
        {:noreply, Map.put(state, :metrics, new_q)}
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