defmodule DashboardSkitter.SendUpdateBehaviour do
    @callback update_workers(bdy :: map) :: nil
    @callback update_edges_workers(bdy :: map) :: nil
    @callback update_components(bdy :: map) :: nil
    @callback update_edges_components(bdy :: map) :: nil
    @callback started(bdy :: number) :: nil
end