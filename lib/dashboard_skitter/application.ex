defmodule DashboardSkitter.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [ #children that needs to be started inside a Supervisor inside a local, worker and master node
      # Start the Telemetry supervisor
      DashboardSkitterWeb.Telemetry,
      # Start the SystemMetrics supervisor
      {DashboardSkitter.SystemMetrics, Map.put(
        %{}, 
        Skitter.Remote.self(),
      %{
        metrics: :queue.new(),
        detailed_mem: [],
        mode: Skitter.Runtime.mode
      })},
      # Start the Workflow supervisor
      {DashboardSkitter.Workflow, 
      %{
        workers: [], 
        components: [],
        start_time: 0,
        isStarted: false
        }
      },
      # Start the Logs supervisor
      {DashboardSkitter.Logs, %{
        counter: 0,
        logs: %{}
      }}
    ]

    children_master = [ #children that only needs to be started in master and local nodes
      # Start the receiver in de master node
      {DashboardSkitter.MasterReceiver, []},
      # Start the PubSub system
      {Phoenix.PubSub, name: DashboardSkitter.PubSub},
      # Start the Endpoint (http/https)
      DashboardSkitterWeb.Endpoint
      # Start a worker by calling: DashboardSkitter.Worker.start_link(arg)
      # {DashboardSkitter.Worker, arg}
    ]

    #Start the handlers for the Skitter events
    DashboardSkitter.TeleHandler.setup()
    #Started to get system metrics
    :application.start(:sasl)
    :application.start(:os_mon)

    #Adds the CustomLogger as backedn to get the log messages
    Logger.add_backend(DashboardSkitter.CustomLogger)

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: DashboardSkitter.Supervisor]
    if Skitter.Runtime.mode() == :local || Skitter.Runtime.mode() == :master do
      #Checks if Skitter has created a workflow before the dashboard has started
      Enum.each(Skitter.Runtime.spawned_workflows(), fn ref -> 
        DashboardSkitter.HandlerFunctions.create_workflow(Skitter.Runtime.get_workflow(ref)) end)
      Supervisor.start_link(List.flatten([children | children_master]), opts)
    else
      Supervisor.start_link(children, opts)
    end
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    DashboardSkitterWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
