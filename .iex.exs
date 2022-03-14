use Skitter.DSL

stream =
  1..20
  |> Stream.cycle()
  |> Stream.map(fn el ->
    Process.sleep(1000) # wacht 1s
    el
  end)

wf = workflow do
  stream_source(stream)
  ~> print()
end #|> Skitter.Runtime.deploy()
