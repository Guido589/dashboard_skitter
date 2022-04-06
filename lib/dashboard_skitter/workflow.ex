defmodule DashboardSkitter.Workflow do
  use GenServer

  def start_link(start) do
    GenServer.start_link(__MODULE__, start, name: :workflow)
  end

  def init(start) do
    {:ok, start}
  end

  def handle_cast({:add_node, node, location}, map) do
    li = map[location]
    new_map = Map.put(map, location, [node | li])
    {:noreply, new_map}
  end

  def handle_cast({:add_recipient, from, to, send_fn, location}, map) do
    li = map[location]
    new_list = Enum.map(li, fn elem -> 
    if elem.id == from do
      if MapSet.member?(elem.to, to) do
        elem
      else
        send_fn.(from, to)
        Map.put(elem, :to, MapSet.put(elem.to, to))
      end
    else elem
    end
    end)
    new_map = Map.put(map, location, new_list)
    {:noreply, new_map}
  end

  def handle_cast({:update_start_time, start_time}, map) do
    new_map = Map.put(map, :start_time, start_time)
    {:noreply, new_map}
  end

  def handle_cast({:update_started, boo}, map) do
    new_map = Map.put(map, :isStarted, boo)
    {:noreply, new_map}
  end

  def add_node(genServer, node, location) do GenServer.cast(genServer, {:add_node, node, location}) end

  def add_recipient(genServer, from, to, send_fn, location) do GenServer.cast(genServer, {:add_recipient, from, to, send_fn, location})end

  def update_start_time(genServer, start_time) do GenServer.cast(genServer, {:update_start_time, start_time}) end

  def update_started(genServer, boo) do GenServer.cast(genServer, {:update_started, boo}) end

  def get_state(genServer) do :sys.get_state(genServer) end
end