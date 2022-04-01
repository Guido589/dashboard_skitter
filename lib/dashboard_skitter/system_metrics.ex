defmodule DashboardSkitter.SystemMetrics do
    alias DashboardSkitterWeb.WebUpdates, as: Updates
  
    def start do
        initial_state = []
        :memsup.set_helper_timeout(1)
        receive_messages(initial_state)
    end
  
    def receive_messages(state) do
        receive do
          msg ->
            {:ok, new_state} = handle_message(msg, state)
            receive_messages(new_state)
        end
    end

    def handle_message({:loop}, state) do
        :timer.sleep(1000)
        mem_bytes = :erlang.memory(:total); 

        Updates.update_metrics(%{
            cpu: Float.round(:cpu_sup.util(), 2),
            mem: mem_bytes})
        send self(), {:loop}
        {:ok, state}
      end
  
  end