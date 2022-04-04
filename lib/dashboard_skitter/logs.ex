defmodule DashboardSkitter.Logs do
    use GenServer

    def start_link(start) do
      GenServer.start_link(__MODULE__, start, name: :logs)
    end
  
    def init(start) do
      {:ok, start}
    end

    def handle_cast({:add_log, new_log}, map) do
        ctr = map.counter
        logs = map.logs
        logs = Map.put(logs, ctr, new_log)
        map = Map.put(map, :logs, logs)
        map = Map.put(map, :counter, ctr + 1)
        {:noreply, map}
    end

    def add_log(new_log) do GenServer.cast(:logs, {:add_log, new_log}) end
    def get_state do :sys.get_state(:logs) end
end