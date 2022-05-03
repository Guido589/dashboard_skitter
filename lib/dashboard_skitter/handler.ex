defmodule DashboardSkitter.TeleHandler do
  use Skitter.DSL
  alias DashboardSkitterWeb.WebUpdates, as: Updates
  alias DashboardSkitter.Workflow, as: Workflow

    @moduledoc """
    Handler to process events from Skitter
    """
  
  def setup do
    events = [
      [:skitter, :worker, :init],
      [:skitter, :worker, :send],
      [:skitter, :runtime, :deploy]
    ]
    :telemetry.attach_many("handler", events, &__MODULE__.handle_event/4, nil)
  end

  #New worker was created. A worker instance needs to be added to the workflow information and an update needs to be send.
  def handle_event([:skitter, :worker, :init], _, %{context: ctx, pid: pid, tag: tag}, _config) do
    name = Skitter.Runtime.node_name_for_context(ctx)
    worker = %{
      name: name, 
      id: pid, 
      to: MapSet.new(),
      tag: tag,
      created_in: Skitter.Remote.self()} #in which node the worker is created
    Workflow.add_node(:workflow, worker, :workers)
    Updates.update_workers(worker)
  end

  #A worker (from) send a message to another worker (to). The new recipient needs to be saved and send
  def handle_event([:skitter, :worker, :send], _, %{from: from, to: to}, _config) do
    send_fn = fn(from, to) -> Updates.update_edges_workers(%{from: from, to: to}) end
    Workflow.add_recipient(:workflow, from, to, send_fn, :workers)
  end

  #A runtime has been deployed. The workflow needs to be saved.
  def handle_event([:skitter, :runtime, :deploy], _, %{ref: ref}, _config) do
    wf = Skitter.Runtime.get_workflow(ref)
    DashboardSkitter.HandlerFunctions.create_workflow(wf)
  end
end