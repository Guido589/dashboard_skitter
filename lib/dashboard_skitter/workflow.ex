defmodule DashboardSkitter.Workflow do
  use GenServer
   @moduledoc """
        GenServer to keep the current state of the workflow. The state is represented by a Map with this structure:
        %{
            workers: [], 
            components: [],
            start_time: ,
            isStarted: 
        }
        In this workflow a list of workers and components is saved. The start time and if the workflow has been started is also saved
        into the workflow.
    """

  def start_link(start) do
    GenServer.start_link(__MODULE__, start, name: :workflow)
  end

  def init(start) do
    {:ok, start}
  end

  #Handles a cast message to add a node. This node is also a map. A node can be added to the list of workers or components.
  def handle_cast({:add_node, node, location}, map) do
    li = map[location]
    new_map = Map.put(map, location, [node | li])
    {:noreply, new_map}
  end

  #Adds a link between two elements. Every element in the workers and components list keep a MapSet to which other elements
  #they are connected. 
  def handle_cast({:add_recipient, from, to, send_fn, location}, map) do
    li = map[location]
    new_list = Enum.map(li, fn elem -> 
    if elem.id == from do #found from element in list to whom we should add a link
      if MapSet.member?(elem.to, to) do #check if to is already added
        elem 
      else
        send_fn.(from, to)                          #send the new conncetion
        Map.put(elem, :to, MapSet.put(elem.to, to)) #add connection to the MapSet
      end
    else elem
    end
    end)
    new_map = Map.put(map, location, new_list) #update the list of elements in the map
    {:noreply, new_map}
  end

  #Updates the start time in the map
  def handle_cast({:update_start_time, start_time}, map) do
    new_map = Map.put(map, :start_time, start_time)
    {:noreply, new_map}
  end

  #Updates the boolean isStarted in the map
  def handle_cast({:update_started, boo}, map) do
    new_map = Map.put(map, :isStarted, boo)
    {:noreply, new_map}
  end

  #Functions to invoke the handle_cast functions of the GenServer
  def add_node(genServer, node, location) do GenServer.cast(genServer, {:add_node, node, location}) end

  def add_recipient(genServer, from, to, send_fn, location) do GenServer.cast(genServer, {:add_recipient, from, to, send_fn, location})end

  def update_start_time(genServer, start_time) do GenServer.cast(genServer, {:update_start_time, start_time}) end

  def update_started(genServer, boo) do GenServer.cast(genServer, {:update_started, boo}) end

  #Gets the current state of the GenServer. This is the map with all the info of the workflow.
  def get_state(genServer) do 
    :sys.get_state(genServer)
  end
end