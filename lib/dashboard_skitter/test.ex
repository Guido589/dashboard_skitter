use Skitter.DSL

defmodule TeleHandler do
  
  def setup do
    events = [
      [:skitter, :worker, :init],
    ]
    :telemetry.attach_many("dummy", events, &__MODULE__.handle_event/4, nil)

  end

  def handle_event([:skitter, :worker, :init], _, %{context: ctx}, _config) do
    name = Skitter.Runtime.node_name_for_context(ctx)
    IO.puts "Server #{name}"
    MapSetWorkers.add_worker(name)
    :sys.get_state(:workers)
  end
end

defmodule MapSetWorkers do
  use GenServer

  def start_link(name) do
    GenServer.start_link(__MODULE__, :ok, name: name)
  end

  def init(:ok) do
    {:ok, MapSet.new()}
  end

  def handle_cast({:add_worker, worker}, mapSet) do
    {:noreply, MapSet.put(mapSet, worker)}
  end

  def handle_call(:nr_workers, _from, mapSet) do
    {:reply, MapSet.size(mapSet), mapSet} 
  end

  def add_worker(name) do
    GenServer.cast(:workers, {:add_worker, name})
  end

  def amount_workers do
    GenServer.call(:workers, :nr_workers)
  end
end