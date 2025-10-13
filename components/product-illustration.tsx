'use client'
import { ArrowUp, FigmaIcon, PlusIcon } from 'lucide-react'
import { PromptInput, PromptInputButton, PromptInputSubmit, PromptInputTextarea, PromptInputToolbar, PromptInputTools } from '@/components/prompt-input'
import { useState } from 'react'
import { Suggestion } from '@/components/suggestion'

export const ProductIllustration = () => {
    const [value, setValue] = useState('')

    const suggestions = [
        { label: 'Write a short story', prompt: 'Write an engaging short story that not only includes a beginning, middle, and end, but also introduces a surprising plot twist that challenges the protagonist’s worldview, ultimately leading to personal growth and a reflective conclusion that leaves the reader pondering the deeper implications of the narrative.' },
        { label: 'Compose a haiku', prompt: 'Create a haiku that captures the subtle nuances of the changing seasons, evoking a sense of wonder and nostalgia as it beautifully contrasts the vibrant colors of spring with the serene stillness of winter.' },
        { label: 'Create a character', prompt: 'Describe a complex character who harbors a deep secret that influences their every decision, affecting their relationships and personal journey, while gradually revealing hints of this secret through their interactions and introspective moments.' },
        { label: 'Imagine a future', prompt: 'Write a vivid scene set in a future world where technological advancements have drastically altered daily life, exploring how these changes impact human relationships, societal norms, and individual identity, while highlighting both the opportunities and challenges of such a future.' },
        { label: 'Explore an emotion', prompt: 'Convey a moment of intense emotion so vividly and authentically that the reader can feel the tension and complexity of the scene, all without explicitly naming the emotion itself, allowing the context and character actions to speak volumes.' },
        { label: 'Write a dialogue', prompt: 'Craft a dialogue between two characters with opposing viewpoints, ensuring that each character’s perspective is presented with depth and nuance, while the conversation reveals underlying motivations and leads to an unexpected resolution that challenges the reader’s assumptions.' },
        { label: 'Describe a place', prompt: 'Vividly describe a place you’ve never visited, using rich and evocative imagery to create a sense of atmosphere and mood that transports the reader there, capturing the essence of the location’s sights, sounds, and even smells.' },
    ]

    return (
        <div className="mx-auto w-full max-w-xl">
            <PromptInput
                onSubmit={() => {}}
                className="relative">
                <PromptInputTextarea
                    onChange={(e) => setValue(e.target.value)}
                    value={value}
                    placeholder="What should we write today?"
                />
                <PromptInputToolbar>
                    <PromptInputTools className="gap-0">
                        <PromptInputButton className="size-8">
                            <PlusIcon size={16} />
                        </PromptInputButton>
                        <PromptInputButton className="h-8 px-2.5">
                            <FigmaIcon size={16} />
                            <span>Design</span>
                        </PromptInputButton>
                    </PromptInputTools>
                    <PromptInputSubmit
                        className="absolute bottom-1 right-1 size-8 shadow-black/25"
                        disabled={!value}
                        status={'ready'}>
                        <ArrowUp strokeWidth={3} />
                    </PromptInputSubmit>
                </PromptInputToolbar>
            </PromptInput>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
                {suggestions.map((suggestion, index) => (
                    <Suggestion
                        key={index}
                        onClick={() => setValue(suggestion.prompt)}
                        suggestion={suggestion.label}
                    />
                ))}
            </div>
        </div>
    )
}