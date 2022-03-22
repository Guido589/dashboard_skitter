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
    worker = %{name: name, pid: inspect(pid), to: MapSet.new() }
    DashboardSkitter.ListWorkers.add_worker(worker)
    DashboardSkitterWeb.WorkerChannel.update_workers(worker)
  end

  def handle_event([:skitter, :worker, :send], _, %{from: from, to: to}, _config) do
    IO.puts "Server FROM #{inspect from} TO #{inspect to}"
    send_fn = fn(from, to) -> DashboardSkitterWeb.WorkerChannel.update_edges(%{from: from, to: to}) end
    DashboardSkitter.ListWorkers.add_recipient(inspect(from), inspect(to), send_fn)
  end
end