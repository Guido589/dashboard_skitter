defmodule DashboardSkitterWeb.WorkerChannel do
    use Phoenix.Channel

    def join("worker", _message, socket) do
        {:ok, socket}
    end

    def handle_in("joined", %{"body" => body}, socket) do
        workers =  DashboardSkitter.ListWorkers.get_state
        broadcast!(socket, "workers", %{reply: workers})
        {:noreply, socket}
      end
end