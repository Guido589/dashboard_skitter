defimpl Jason.Encoder, for: [MapSet, Range, Stream] do
    def encode(struct, opts) do
      Jason.Encode.list(Enum.to_list(struct), opts)
    end
  end

  defimpl Jason.Encoder, for: [Tuple] do
    def encode(struct, opts) do
      Jason.Encode.list(Tuple.to_list(struct), opts)
    end
  end

  defimpl Jason.Encoder, for: [PID] do
    def encode(struct, opts) do
      Jason.Encode.string(inspect(struct), opts)
    end
  end