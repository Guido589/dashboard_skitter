use Skitter.DSL

defmodule TeleHandler do
  def setup do
    events = [
      [:skitter, :worker, :init],
    ]
    :telemetry.attach_many("dummy", events, &__MODULE__.handle_event/4, nil)
  end

  def handle_event([:skitter, :worker, :init], _, %{context: ctx}, _config) do
    IO.puts "Server #{Skitter.Runtime.node_name_for_context(ctx)}" 
  end
end