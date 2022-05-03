defmodule DashboardSkitter.SystemMetrics do
    alias DashboardSkitterWeb.WebUpdates, as: Updates
    use GenServer

   @moduledoc """
        GenServer to keep track of the performance of the Skitter workflow. Every node in the cluster keeps track of their own performance.
        The state is represented by a Map with this structure:
        %{
            %{
                metrics: :queue, 
                detailed_mem: [],
                start_time: ,
                mode: 
            }
        }
        The metrics are saved in metrics in a queue. It is saved in a queue because only 300 measurements are saved at one time. This is
        5 minutes worth of measurements. The detailed memory gives a detailed overview of the used memory. This detailed overview is always from
        the last measurement.
    """

    @max_amount_metrics 300
  
    def start_link(start) do
      GenServer.start_link(__MODULE__, start, name: :system_metrics)
    end
  
    def init(start) do
        start_loop()
        {:ok, start}
    end

    #Converts the obtained bytes into megabytes
    def from_bytes_to_mb(bytes) do
        (bytes / (1024 * 1024)) |> Float.round(2)
    end

    #Selects all the needed information from mem to get the detailed overview of the system memory usage. This gives an overview of how we arrive at the total
    def select_mem_info(mem) do
        atom = mem[:atom]
        binary = mem[:binary]
        code = mem[:code]
        ets = mem[:ets]
        processes = mem[:processes]
        system = mem[:system]
        %{
            Atoms: from_bytes_to_mb(atom),
            Binary: from_bytes_to_mb(binary),
            Code: from_bytes_to_mb(code),
            Ets: from_bytes_to_mb(ets),
            Processes: from_bytes_to_mb(processes),
            Other: from_bytes_to_mb(system - atom - binary - code - ets)
        }
    end

    #Adds the detailed memory usage, metrics to the node of the cluster
    def add_info(metrics, metric, map, node, name, mem) do
        updated_node = Map.merge(node, %{detailed_mem: mem, metrics: add_metric(metrics, metric)})
        {:noreply, Map.put(map,name, updated_node)}
    end

    #From the detailed memory a total is calculated
    def calculate_total(mem_detailed) do
        Enum.reduce(mem_detailed, 0, fn({_k, v}, acc) -> v + acc end)
    end

    #This cast gets invoked on a master node. A worker node send an update of their metrics. This can be the first time or the worker is already saved into the state of the master.
    def handle_cast({:add_metric_remote, bdy}, map) do
        if Enum.member?(Map.keys(map), bdy.name) do #check if the node is already present in this map
         state_node = map[bdy.name]                 #gets the saved state of the other node
         Updates.update_metrics(bdy)                #send the update to the client
         add_info(state_node.metrics, bdy.metric, map, state_node, bdy.name, bdy.detailed_mem) #save the update
        else #not present so add the worker to the map
         {:noreply, Map.put(map, bdy.name,
                %{
                 metrics: :queue.in(bdy.metric, :queue.new()),
                 detailed_mem: bdy.detailed_mem
                 })
             }
        end
     end

     #Loops every second and retrieves all the system info necessary
    def handle_cast({:loop}, map) do
        :timer.sleep(1000)
        state_node = map[Skitter.Remote.self()]
        mem = :erlang.memory()              #gets the memory usage
        detailed_info = select_mem_info(mem)
        mem_bytes = calculate_total(detailed_info) |> Float.round(2) #calculate the total usage
        cpu = Float.round(:cpu_sup.util(), 2) #gets the cpu utilization
        metric =%{ #creates a new memory and cpu usage instance with the current time
            time: DateTime.utc_now() |> DateTime.to_unix(),
            cpu: cpu,
            mem: mem_bytes
        } 
        Updates.update_metrics(%{ #sends an update to the client or master
            name: Skitter.Remote.self(),
            metric: metric, 
            detailed_mem: detailed_info
            })
        loop()
        if(Skitter.Runtime.mode == :worker) do
            {:noreply, Map.put(%{}, Skitter.Remote.self(),%{})} #no need to save on worker nodes
        else 
            add_info(state_node.metrics, metric, map, state_node, Skitter.Remote.self(), detailed_info) #update state
        end
    end

    #start the loop to update the system metrics
    def start_loop() do GenServer.cast(:system_metrics, {:loop}) end
    def loop() do GenServer.cast(:system_metrics, {:loop}) end #restarts the loop
    def add_metric_remote(bdy) do GenServer.cast(:system_metrics, {:add_metric_remote, bdy}) end #invoked when a remote worker sends an update to the master

    def get_state() do 
        :sys.get_state(:system_metrics)
    end

    #Adds metrics to the queue but it first checks that the length of the queue isn't longer than the @max_amount_metrics
    def add_metric(state_node, metric) do
        if :queue.len(state_node) >= @max_amount_metrics do
            {_, temp_q} = :queue.out(state_node)
            :queue.in(metric, temp_q)
        else
            :queue.in(metric, state_node)
        end
    end  
end