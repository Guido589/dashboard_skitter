defmodule DashboardSkitter.TeleHandler do
  use Skitter.DSL
  alias DashboardSkitter.WebUpdates, as: Updates
  alias DashboardSkitter.ListNodes, as: ListNodes
  
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
    worker = %{name: name, id: inspect(pid), to: MapSet.new() }
    ListNodes.add_node(:workers, worker)
    Updates.update_workers(worker)
  end

  def handle_event([:skitter, :worker, :send], _, %{from: from, to: to}, _config) do
    IO.puts "Server FROM #{inspect from} TO #{inspect to}"
    send_fn = fn(from, to) -> Updates.update_edges_workers(%{from: from, to: to}) end
    ListNodes.add_recipient(:workers, inspect(from), inspect(to), send_fn)
  end

  def handle_event([:skitter, :runtime, :deploy], _, %{ref: ref}, _config) do
    wf = Skitter.Runtime.get_workflow(ref)
    nodes = wf.nodes

    Enum.each(nodes, fn {componentKey, componentInfo} ->
       component = %{name: componentInfo.component, id: componentKey, to: MapSet.new() }
        ListNodes.add_node(:components, component)
        Updates.update_components(component)
        get_links(componentKey, componentInfo.links) 
      end)
    end

  def get_links(from, links) do
    Enum.map(links, fn {_,v} ->      
      Enum.map(v, fn {k, _} -> 
        send_fn = fn(from, to) -> Updates.update_edges_components(%{from: from, to: to}) end     
        ListNodes.add_recipient(:components, from, k, send_fn) end) 
    end)
  end
end