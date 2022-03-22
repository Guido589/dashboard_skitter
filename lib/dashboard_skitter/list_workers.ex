defmodule DashboardSkitter.ListWorkers do
  use GenServer

  def start_link(name) do
    GenServer.start_link(__MODULE__, :ok, name: name)
  end

  def init(:ok) do
    {:ok, []}
  end

  def handle_cast({:add_worker, worker}, li) do
    {:noreply, [worker | li]}
  end

  def handle_cast({:add_recipient, from, to, send_fn}, li) do
    new_list = Enum.map(li, fn elem -> 
    if elem.pid == from do
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

  def handle_call(:nr_workers, _from, li) do
    {:reply, Enum.count(li), li} 
  end

  def add_worker(worker) do
    GenServer.cast(:workers, {:add_worker, worker})
  end

  def add_recipient(from, to, send_fn) do
    GenServer.cast(:workers, {:add_recipient, from, to, send_fn})
  end

  def amount_workers do
    GenServer.call(:workers, :nr_workers)
  end

  def get_state do
    :sys.get_state(:workers)
  end
end