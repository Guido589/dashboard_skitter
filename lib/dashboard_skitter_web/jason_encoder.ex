#Implementations for the Jason encoder. Not all Elixir data types are supported to send
#to the client. The data types that are not supported get transformed into supported types.


#Transforms MapSet, Range and stream into a list
defimpl Jason.Encoder, for: [MapSet, Range, Stream] do
  def encode(struct, opts) do
    Jason.Encode.list(Enum.to_list(struct), opts)
  end
end


#Transforms Tuples into a list
defimpl Jason.Encoder, for: [Tuple] do
  def encode(struct, opts) do
    Jason.Encode.list(Tuple.to_list(struct), opts)
  end
end

#Transforms PID into a string
defimpl Jason.Encoder, for: [PID] do
  def encode(struct, opts) do
    Jason.Encode.string(inspect(struct), opts)
  end
end