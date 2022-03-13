defmodule DashboardSkitter.ListWorkers do
  use GenServer

  def start_link(name) do
    GenServer.start_link(__MODULE__, :ok, name: name)
  end

  def init(:ok) do
    {:ok, []}
  end

  def handle_cast({:add_worker, worker, pid}, li) do
    {:noreply, [%{name: worker, pid: pid, to: []} | li]}
  end

  def handle_cast({:add_recipient, from, to}, li) do
    new_list = Enum.map(li, fn elem -> 
    if elem.pid == inspect from do
      Map.put(elem, :to, [inspect(to) | elem.to])
    else elem
    end
    end)
    {:noreply, new_list}
  end

  def handle_call(:nr_workers, _from, li) do
    {:reply, Enum.count(li), li} 
  end

  def add_worker(name, pid) do
    GenServer.cast(:workers, {:add_worker, name, pid})
  end

  def add_recipient(from, to) do
    GenServer.cast(:workers, {:add_recipient, from, to})
  end

  def amount_workers do
    GenServer.call(:workers, :nr_workers)
  end

  def get_state do
    :sys.get_state(:workers)
  end
end