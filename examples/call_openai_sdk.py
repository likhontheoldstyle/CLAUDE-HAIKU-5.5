from openai import OpenAI

client = OpenAI(base_url="http://localhost:3000/v1", api_key="not-needed")

print([m.id for m in client.models.list().data])

resp = client.chat.completions.create(
    model="claude-haiku-5-5",  # or "Claude Haiku"
    messages=[{"role": "user", "content": "hi"}],
)
print(resp.choices[0].message.content)

img = client.images.generate(model="claude-haiku-5-5", prompt="a cat astronaut in space")
print([d.url for d in img.data])
