defmodule DashboardSkitter.TeleHandler do
  use Skitter.DSL
  
  def setup do
    events = [
      [:skitter, :worker, :init],
      [:skitter, :worker, :send],
      [:skitter, :runtime, :deploy]
    ]
    :telemetry.attach_many("dummy", events, &__MODULE__.handle_event/4, nil)

  end

  def handle_event([:skitter, :worker, :init], _, %{context: ctx, pid: pid}, _config) do
    name = Skitter.Runtime.node_name_for_context(ctx)
    IO.puts "Server #{name}"
    worker = %{name: name, pid: inspect(pid), to: MapSet.new() }
    DashboardSkitter.ListNodes.add_node(:workers, worker)
    DashboardSkitterWeb.UserChannel.update_workers(worker)
  end

  def handle_event([:skitter, :worker, :send], _, %{from: from, to: to}, _config) do
    IO.puts "Server FROM #{inspect from} TO #{inspect to}"
    send_fn = fn(from, to) -> DashboardSkitterWeb.UserChannel.update_edges(%{from: from, to: to}) end
    DashboardSkitter.ListNodes.add_recipient(:workers, inspect(from), inspect(to), send_fn)
  end

  def handle_event([:skitter, :runtime, :deploy], _, %{ref: ref}, _config) do
    Skitter.Runtime.get_workflow(ref).nodes
      |> Map.values()
      |> Enum.each(
        fn x ->
          component = %{name: x.component, pid: Enum.random(0..100), to: MapSet.new() }
          DashboardSkitter.ListNodes.add_node(:components, component)
          DashboardSkitterWeb.UserChannel.update_components(component) 
      end)
    end
end