use Skitter.DSL

wf = workflow do
  stream_source(1..10)
  ~> print()
end |> Skitter.Runtime.deploy()