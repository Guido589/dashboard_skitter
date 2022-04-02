defmodule DashboardSkitterWeb.UserChannel do
    use Phoenix.Channel

    @channel_name "user"

    def join(@channel_name, _message, socket) do
        send(self(), :after_join)
        {:ok, socket}
      end
  
    def handle_info(:after_join, socket) do
      workflow = DashboardSkitter.Workflow.get_state(:workflow)
      info = Map.put(workflow, :cluster_nodes, DashboardSkitter.SystemMetrics.get_state())
      push(socket, "initialize", %{reply: info})
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

    def started(bdy) do  
      DashboardSkitterWeb.Endpoint.broadcast(@channel_name, "started", %{msg: bdy})
    end

    def update_metrics(bdy) do
      DashboardSkitterWeb.Endpoint.broadcast(@channel_name, "update_metrics", %{msg: bdy})
    end
end