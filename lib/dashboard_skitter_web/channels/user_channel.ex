defmodule DashboardSkitterWeb.UserChannel do
    use Phoenix.Channel

    @channel_name "user"

    def join(@channel_name, _message, socket) do
        send(self(), :after_join)
        {:ok, socket}
      end
  
    def handle_info(:after_join, socket) do
      workers = DashboardSkitter.ListNodes.get_state(:workers)
      components = DashboardSkitter.ListNodes.get_state(:components)
      reply = %{workers: workers, components: components}
      push(socket, "initialize", %{reply: reply})
      {:noreply, socket}
    end

    def update_workers(bdy) do
      DashboardSkitterWeb.Endpoint.broadcast(@channel_name, "update_workers", %{msg: bdy})
    end

    def update_edges_workers(bdy) do
      DashboardSkitterWeb.Endpoint.broadcast(@channel_name, "update_edges_workers", %{msg: bdy})
    end

    def update_components(bdy) do
      DashboardSkitterWeb.Endpoint.broadcast(@channel_name, "update_components", %{msg: bdy})
    end

    def update_edges_components(bdy) do  
      DashboardSkitterWeb.Endpoint.broadcast(@channel_name, "update_edges_components", %{msg: bdy})
    end
end