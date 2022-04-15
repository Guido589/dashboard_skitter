defmodule DashboardSkitter.TeleHandler do
  use Skitter.DSL
  alias DashboardSkitterWeb.WebUpdates, as: Updates
  alias DashboardSkitter.Workflow, as: Workflow
  
  def setup do
    events = [
      [:skitter, :worker, :init],
      [:skitter, :worker, :send],
      [:skitter, :runtime, :deploy]
    ]
    :telemetry.attach_many("dummy", events, &__MODULE__.handle_event/4, nil)
  end

  def handle_event([:skitter, :worker, :init], _, %{context: ctx, pid: pid, tag: tag}, _config) do
    name = Skitter.Runtime.node_name_for_context(ctx)
    worker = %{
      name: name, 
      id: pid, 
      to: MapSet.new(),
      tag: tag,
      created_in: Skitter.Remote.self()}
    Workflow.add_node(:workflow, worker, :workers)
    Updates.update_workers(worker)
  end

  def handle_event([:skitter, :worker, :send], _, %{from: from, to: to}, _config) do
    send_fn = fn(from, to) -> Updates.update_edges_workers(%{from: from, to: to}) end
    Workflow.add_recipient(:workflow, from, to, send_fn, :workers)
  end

  def handle_event([:skitter, :runtime, :deploy], _, %{ref: ref}, _config) do
    wf = Skitter.Runtime.get_workflow(ref)
    nodes = wf.nodes

    Enum.each(nodes, fn {componentKey, componentInfo} ->
       component = %{name: componentInfo.component, id: componentKey, to: MapSet.new()}
       Workflow.add_node(:workflow, component, :components)
       Updates.update_components(component)
       get_links(componentKey, componentInfo.links) 
      end)

    Workflow.update_started(:workflow, true)
    Updates.started(initialize_start_time())
  end

  def get_links(from, links) do
    Enum.map(links, fn {_,v} ->      
      Enum.map(v, fn {k, _} -> 
        send_fn = fn(from, to) -> Updates.update_edges_components(%{from: from, to: to}) end     
        Workflow.add_recipient(:workflow, from, k, send_fn, :components) end) 
    end)
  end

  def initialize_start_time() do
    start_time = DateTime.utc_now() |> DateTime.to_unix()
    Workflow.update_start_time(:workflow, start_time)
    start_time
  end
end