defmodule DashboardSkitter.ListWorkers do
  use GenServer

  def start_link(name) do
    GenServer.start_link(__MODULE__, :ok, name: name)
  end

  def init(:ok) do
    {:ok, []}
  end

  def handle_cast({:add_worker, worker, pid}, li) do
    {:noreply, [%{name: worker, pid: pid} | li]}
  end

  def handle_call(:nr_workers, _from, li) do
    {:reply, Enum.count(li), li} 
  end

  def add_worker(name, pid) do
    GenServer.cast(:workers, {:add_worker, name, pid})
  end

  def amount_workers do
    GenServer.call(:workers, :nr_workers)
  end

  def get_state do
    :sys.get_state(:workers)
  end
end