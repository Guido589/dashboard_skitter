defmodule DashboardSkitter.TeleHandler do
  use Skitter.DSL
  
  def setup do
    events = [
      [:skitter, :worker, :init],
      [:skitter, :worker, :send]
    ]
    :telemetry.attach_many("dummy", events, &__MODULE__.handle_event/4, nil)

  end

  def handle_event([:skitter, :worker, :init], _, %{context: ctx, pid: pid}, _config) do
    name = Skitter.Runtime.node_name_for_context(ctx)
    IO.puts "Server #{name}"
    DashboardSkitter.ListWorkers.add_worker(name, inspect pid)
  end

  def handle_event([:skitter, :worker, :send], _, %{from: from, to: to}, _config) do
    IO.puts "Server FROM #{inspect from} TO #{inspect to}"
    DashboardSkitter.ListWorkers.add_recipient(from, to)
  end
end