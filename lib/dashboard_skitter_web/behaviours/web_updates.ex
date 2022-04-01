defmodule DashboardSkitterWeb.WebUpdates do
    alias DashboardSkitterWeb.UserChannel, as: UserChannel

    @behaviour DashboardSkitter.SendUpdateBehaviour

    def update_workers(bdy) do UserChannel.update_workers(bdy) end
    def update_edges_workers(bdy) do UserChannel.update_edges_workers(bdy) end
    def update_components(bdy) do UserChannel.update_components(bdy) end
    def update_edges_components(bdy) do UserChannel.update_edges_components(bdy) end
    def started(bdy) do UserChannel.started(bdy) end
    def update_metrics(bdy) do UserChannel.update_metrics(bdy) end
end