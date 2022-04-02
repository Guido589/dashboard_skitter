defmodule DashboardSkitter.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      # Start the Telemetry supervisor
      DashboardSkitterWeb.Telemetry,
      {DashboardSkitter.SystemMetrics, %{
        name: "root",
        metrics: :queue.new()
      }},
      {DashboardSkitter.Workflow, %{
                                    workers: [], 
                                    components: [],
                                    start_time: 0,
                                    isStarted: false}},
      # Start the PubSub system
      {Phoenix.PubSub, name: DashboardSkitter.PubSub},
      # Start the Endpoint (http/https)
      DashboardSkitterWeb.Endpoint
      # Start a worker by calling: DashboardSkitter.Worker.start_link(arg)
      # {DashboardSkitter.Worker, arg}
    ]

    DashboardSkitter.TeleHandler.setup()
    :application.start(:sasl)
    :application.start(:os_mon)

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: DashboardSkitter.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    DashboardSkitterWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
