defmodule DashboardSkitterWeb.WorkerChannel do
    use Phoenix.Channel

    def join("worker", _message, socket) do
        send(self(), :after_join)
        {:ok, socket}
      end
  
    def handle_info(:after_join, socket) do
      workers =  DashboardSkitter.ListWorkers.get_state
      push(socket, "initialize_workers", %{reply: workers})
      {:noreply, socket}
    end

    def update_workers(bdy) do
      DashboardSkitterWeb.Endpoint.broadcast("worker", "update_workers", %{msg: bdy})
    end

    def update_edges(bdy) do
      DashboardSkitterWeb.Endpoint.broadcast("worker", "update_edges", %{msg: bdy})
    end
end