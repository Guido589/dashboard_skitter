defmodule DashboardSkitter.TeleHandler do
  use Skitter.DSL
  
  def setup do
    events = [
      [:skitter, :worker, :init],
    ]
    :telemetry.attach_many("dummy", events, &__MODULE__.handle_event/4, nil)

  end

  def handle_event([:skitter, :worker, :init], _, %{context: ctx}, _config) do
    name = Skitter.Runtime.node_name_for_context(ctx)
    IO.puts "Server #{name}"
    DashboardSkitter.ListWorkers.add_worker(name)
  end
end