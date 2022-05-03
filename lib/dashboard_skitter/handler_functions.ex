defmodule DashboardSkitter.HandlerFunctions do
    alias DashboardSkitterWeb.WebUpdates, as: Updates
    alias DashboardSkitter.Workflow, as: Workflow

    @moduledoc """
    Help functions to create a worklow from an event or after requesting information to Skitter after the dashboard has been started
    """

    #Creates a workflow by looping over every component node in the workflow. While looping over every component the links of the 
    #components are also retrieved.
    def create_workflow(wf) do
        nodes = wf.nodes
        Enum.each(nodes, fn {componentKey, componentInfo} ->
           component = %{
               name: componentInfo.component,
               strategy: componentInfo.strategy, 
               id: componentKey, 
               to: MapSet.new()}
           Workflow.add_node(:workflow, component, :components) #save component
           Updates.update_components(component) #send component
           get_links(componentKey, componentInfo.links) #get the links of the component
          end)
    
        Workflow.update_started(:workflow, true) #workflow is started
        Updates.started(initialize_start_time()) #initializes the start time of the workflow
    end
    
    #gets the current time and adds the time to the workflow
    def initialize_start_time() do
        start_time = DateTime.utc_now() |> DateTime.to_unix()
        Workflow.update_start_time(:workflow, start_time)
        start_time
    end

    #gets all the links of the component
    def get_links(from, links) do
        Enum.map(links, fn {_,v} ->      
          Enum.map(v, fn {k, _} -> 
            send_fn = fn(from, to) -> Updates.update_edges_components(%{from: from, to: to}) end #send link  
            Workflow.add_recipient(:workflow, from, k, send_fn, :components) end) #add link to component in the workflow
        end)
    end
end