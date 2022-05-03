defmodule DashboardSkitter.SendUpdateBehaviour do

    @moduledoc """
    Behaviour to implement to get updates from dashboard_skitter
    """

    # Skitter metrics
    @callback update_workers(bdy :: map) :: nil
    @callback update_edges_workers(bdy :: map) :: nil
    @callback update_components(bdy :: map) :: nil
    @callback update_edges_components(bdy :: map) :: nil
    @callback started(bdy :: number) :: nil

    # System metrics
    @callback update_metrics(bdy :: map) :: nil

    # Logger
    @callback add_log(bdy :: map) :: nil
end