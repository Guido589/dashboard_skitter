defmodule DashboardSkitter.ListNodes do
  use GenServer

  def start_link(name) do
    GenServer.start_link(__MODULE__, :ok, name: name)
  end

  def init(:ok) do
    {:ok, []}
  end

  def handle_cast({:add_node, node}, li) do
    {:noreply, [node | li]}
  end

  def handle_cast({:add_recipient, from, to, send_fn}, li) do
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
    {:noreply, new_list}
  end

  def handle_call(:nr_nodes, _from, li) do
    {:reply, Enum.count(li), li} 
  end

  def add_node(genServer, node) do
    GenServer.cast(genServer, {:add_node, node})
  end

  def add_recipient(genServer, from, to, send_fn) do
    GenServer.cast(genServer, {:add_recipient, from, to, send_fn})
  end

  def amount_nodes(genServer) do
    GenServer.call(genServer, :nr_nodes)
  end

  def get_state(genServer) do
    :sys.get_state(genServer)
  end
end