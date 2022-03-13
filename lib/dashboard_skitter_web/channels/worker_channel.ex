defmodule DashboardSkitterWeb.WorkerChannel do
    use Phoenix.Channel

    def join("worker", _message, socket) do
        send(self, :after_join)
        {:ok, socket}
      end
  
      def handle_info(:after_join, socket) do
        workers =  DashboardSkitter.ListWorkers.get_state
        push(socket, "workers", %{reply: workers})
        {:noreply, socket}
      end

#    def handle_in("joined", %{"body" => body}, socket) do
#        workers =  DashboardSkitter.ListWorkers.get_state
#        broadcast!(socket, "workers", %{reply: workers})
#        {:noreply, socket}
#      end
end