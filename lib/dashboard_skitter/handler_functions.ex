defmodule DashboardSkitter.HandlerFunctions do
    alias DashboardSkitterWeb.WebUpdates, as: Updates
    alias DashboardSkitter.Workflow, as: Workflow

    def create_workflow(wf) do
        nodes = wf.nodes
        Enum.each(nodes, fn {componentKey, componentInfo} ->
           component = %{
               name: componentInfo.component,
               strategy: componentInfo.strategy, 
               id: componentKey, 
               to: MapSet.new()}
           Workflow.add_node(:workflow, component, :components)
           Updates.update_components(component)
           get_links(componentKey, componentInfo.links) 
          end)
    
        Workflow.update_started(:workflow, true)
        Updates.started(initialize_start_time())
    end
    
    def initialize_start_time() do
        start_time = DateTime.utc_now() |> DateTime.to_unix()
        Workflow.update_start_time(:workflow, start_time)
        start_time
    end

    def get_links(from, links) do
        Enum.map(links, fn {_,v} ->      
          Enum.map(v, fn {k, _} -> 
            send_fn = fn(from, to) -> Updates.update_edges_components(%{from: from, to: to}) end     
            Workflow.add_recipient(:workflow, from, k, send_fn, :components) end) 
        end)
    end
end