import { Scene } from "../types/nexus-sum";
// Generate the prompt for the LLM
export function P_generatePrompt(scenes: string[], strat?: string): string {
    return `

## Strategy:
 ${strat}

 ## Instructions:
1. Transform the dialogue into narrative form, integrating it smoothly with the descriptive text.
2. Follow each step of the provided strategy meticulously.

 ## INPUT SCRIPT SCENES
${scenes.map((scene, index) => `SCENE ${index + 1}:\n${scene}\n\n`).join("")}

## Output Format:
For each scene in the input, create a corresponding scene object with:
- sceneId: The exact scene heading (e.g., "INT. HALL OF KINGS")
- sceneBody: The narrative prose version of the scene

IMPORTANT: You must output EXACTLY ${scenes.length} scenes, no more and no less.
`
}

// System prompt for the LLM
export const P_SYSTEM_PROMPT = `
You are a skilled scriptwriter and narrative expert. Using the strategy provided below, transform
the given script by converting dialogue into narrative form while seamlessly integrating it with the
original descriptive text. Ensure that you preserve all essential elements such as scene headings, time,
background, and event descriptions.

`

export function P_COT_generatePrompt(scenes: string[]): string {
    return `

## INPUT_SCRIPT
${scenes.map((scene, index) => `SCENE ${index + 1}:\n${scene}\n\n`).join("")}


## Guidelines:
1. Analyze the provided script carefully, noting its structure, style, and unique features.
2. Identify the types of dialogue present (e.g., conversations, monologues, voice-overs).
3. Recognize the script’s format for scene headings, time indicators, and descriptive elements.
4. Determine the overall tone and atmosphere of the script.
5. Create a detailed, step-by-step strategy for transforming this specific script, addressing:
- How to handle the particular dialogue styles present
- Methods to preserve the script’s unique formatting and structural elements
- Techniques for maintaining the script’s tone and atmosphere in narrative form
- Approaches to seamlessly integrate dialogue with descriptive text



## Output Format:
[Strategy Here]

`
}

export const P_COT_SYSTEM_PROMPT = `
You are an expert script analyst tasked with creating a tailored strategy to transform a specific script’s
dialogue into narrative form while preserving essential elements. Your strategy should be based on the
unique characteristics of the input script provided`






export function S_generatePrompt(scenes: Scene[]): string {
    // Extract scene bodies and format them with their scene IDs
    const formattedScenes = scenes.map((scene, index) =>
        `SCENE ${index + 1} - ${scene.sceneId}:\n${scene.sceneBody}\n\n`
    ).join("");

    return `
## PART_OF_SCRIPT
${formattedScenes}

## Truncated Examples of Output:
### You should try to emulate the writing style of the below snippets:
## Examples:
### You should try to emulate the writing style and prose of the following examples

#### Writing Snippet 1:
In 1963, teenager Frank William Abagnale Jr. lives in New Rochelle, New York with his father Frank Abagnale Sr. and his French mother Paula. During his youth, he witnesses his father's many techniques for conning people. When Frank Sr. encounters tax problems with the Internal Revenue Service, the family is forced to move from their large home to a small apartment. One day, Frank discovers that his mother is having an affair with his father's friend Jack Barnes.

#### Writing Snippet 2:
 When his parents divorce, Frank runs away. Needing money, he turns to confidence scams to survive and his cons grow bolder. He impersonates a Pan Am pilot and forges the airline's payroll checks. Soon, his forgeries are worth millions of dollars. News of the crimes reach the Federal Bureau of Investigation (FBI) and agent Carl Hanratty begins tracking Frank.
### Writing Snippet 3:
One weekend, Frank prepares to impersonate a pilot again and is intercepted by Carl, who allows him to carry on his act, assuring him that no one is chasing him. As Frank returns to work and discusses another fraud case with Carl, the post-script indicates that Frank has lived for 26 years in the Midwestern United States with his wife, with whom he has had three sons, remains friends with Carl, and has built a successful living as one of the world's leading experts on bank fraud and forgery.

--------------------------------------------
Now, write a summary of the following PART_OF_SCRIPT.

## Guidelines:
- Write as if you're telling someone what happens in the story, not analyzing it
- Use present tense and describe events as they unfold
- Start scenes with immediate action or character focus, not setup phrases
- Avoid phrases like "The story establishes," "The narrative shows," "The history of X is established"
- Write like: "Five tribes war over vibranium" not "The history shows five tribes warring"

## CRITICAL: 
Start your summary with immediate action or character focus. Write "Five tribes war over vibranium" not "The history of Wakanda is established." Use present tense active voice throughout.
## Output Format:
# Summary
[Your summary here]
`
}

// System prompt for the LLM
export const S_SYSTEM_PROMPT = `
You are an expert storyteller. Create a concise summary of the given part of the script. Refer to the
Example Output to generate the output following their styles
`



// System prompt for the compressor as specified
export const C_SYSTEM_PROMPT = `You are an expert storyteller. Create a concise meta summary of the given previous summary referring
the Exmaple Input Output pairs"`

// Generate the prompt for the compressor as specified
export function C_generatePrompt(text: string, count: number): string {
    return `

## Example Input Output Pairs
### Example Previous Summary 01
At dawn, the Thrombey Estate is enveloped in mist and silence, its grandeur masking an underlying tension. Inside, the aftermath of a party lingers as Fran, the housekeeper, quietly moves through the manor, eventually discovering the gruesome murder of Harlan Thrombey in his attic study. The shock of his death reverberates, cutting to one week later where Marta Cabrera, Harlan's caregiver, struggles with trauma and anxiety in her modest South Boston apartment. Family tensions flare in the Cabrera kitchen as Marta's mother tries to shield her from reminders of the murder, leading to an emotional breakdown. The suspense heightens when Marta receives a cryptic phone call from Walt Thrombey, hinting at new developments in the wake of Harlan's demise. Marta arrives at the grand Thrombey estate, her modest car and anxious demeanor setting her apart from the opulent surroundings and the tense atmosphere following Harlan Thrombey's recent death. Greeted with suspicion by police and comforted by Meg, Harlan's granddaughter, Marta is reassured of her place in the family despite underlying class tensions. Inside, Linda and Richard Thrombey, along with other family members, prepare for police interviews about the night of Harlan's death, revealing strained relationships and personal ambitions. Through a series of flashbacks and interrogations led by Lieutenant Elliott and Trooper Wagner, the family's dynamics and secrets begin to surface, with each member recounting their version of the fateful birthday party. The tone is one of suspense and drama, as the investigation peels back layers of familial loyalty, rivalry, and hidden motives. During a lively family party at the Thrombey estate, tensions simmer beneath the surface as Walt, his wife Donna, and their son Jacob navigate awkward interactions and generational divides
### Example Meta Summary 01
The Thrombey family murder mystery unfolds across two timelines, beginning with the shocking discovery of patriarch Harlan Thrombey's brutal death in his estate and jumping forward a week to show the aftermath's impact on his caregiver, Marta Cabrera. Class tensions and family dysfunction emerge as Marta, from her modest Boston background, navigates the opulent but hostile Thrombey world while police investigations reveal deep-seated rivalries and hidden motives among the wealthy family members. The narrative weaves between present-day interrogations and flashbacks to Harlan's final birthday party, exposing layers of ambition, resentment, and secrets that suggest the murder may be rooted in complex family dynamics rather than a simple crime.
### Example Previous Summary 02
In a tense flashback during the night of the party at the Thrombey estate, Marta carefully avoids being seen as she navigates the house, haunted by Harlan's instructions and the knowledge that security cameras have recorded her movements. She narrowly escapes detection by Walt, Jacob, and Greatnana, whose confusion provides her a momentary reprieve. Later, Harlan advises Marta to avoid lying outright, instead urging her to tell selective truths to protect herself. During a police interview in the library, Marta maintains her composure under scrutiny, recounting her actions with clinical precision while concealing her anxiety. The suspense culminates as Marta, overwhelmed by guilt and fear, retreats to a bathroom to vomit, revealing the immense psychological toll of her predicament. As the Thrombey family gathers for Harlan's memorial, Linda mourns privately in her childhood room, reflecting on her father's cryptic nature and the affectionate notes he left her. The evening reception is tense, with Marta feeling isolated and overwhelmed as Fran voices suspicions about Harlan's death, prompting Marta to recall the fraught night of the party, where family arguments and uncomfortable questions about her immigration status left her shaken. Seeking comfort, Marta is supported by Meg and Fran, who share a moment of camaraderie in the drawing room. Meanwhile, the family offers Marta financial help, acknowledging her kindness to Harlan, though their motives remain ambiguous. Later, detective Benoit Blanc confides in Marta on the porch, revealing his suspicions and enlisting her as his confidant in the ongoing investigation, while Marta returns home, burdened by uncertainty and memories, as the tone shifts between grief, suspicion, and the search for truth. In a tense series of flashbacks, Harlan Thrombey urges Marta to take decisive action to protect herself, culminating in his shocking suicide before her eyes, leaving Marta traumatized and desperate.
### Example Meta Summary 02
Marta Cabrera struggles with the psychological burden of concealing her involvement in Harlan Thrombey's death, carefully navigating police interrogations and family interactions while fighting her physical inability to lie without becoming sick. The narrative reveals through flashbacks that Harlan orchestrated his own suicide to protect Marta from consequences, leaving her traumatized and alone with the terrible secret. As the Thrombey family memorial unfolds, tensions mount with Fran expressing suspicions about the death, while detective Benoit Blanc begins forming an alliance with Marta, sensing she holds key information about the case but unaware of the full truth of Harlan's final moments.
### Example Previous Summary 03
The tone is one of relentless suspense and fear, with characters pushed to their emotional and physical limits. As violence erupts in the master bedroom, Burnham desperately pleads with Raoul to stop beating Harris, invoking the presence of Harris’s child as a witness, but Raoul remains unmoved and continues the assault. Burnham, unable to bear the brutality, covers the camera lens, sparing those in the panic room from witnessing the horror. Inside the panic room, Meg and her daughter Sarah are left in terrified uncertainty, which escalates when Sarah suffers a seizure, prompting Meg to take urgent action to save her. As Meg opens the panic room door and rushes out in search of help, a tense game of deception unfolds: Harris is disguised in Burnham’s shirt in the living room, while Burnham, now in Harris’s shirt, awakens in the master bedroom to find the panic room door wide open. The sequence is charged with suspense and desperation, as shifting identities and mounting danger propel the characters toward a dramatic confrontation. In a tense and suspenseful sequence, Meg frantically retrieves life-saving medicine for her daughter Sarah, only to be confronted by the masked intruder Raoul as she tries to escape. A violent struggle ensues in the master bedroom, resulting in Meg managing to throw the medicine into the panic room just before the door seals shut, leaving her distraught and separated from Sarah. Inside the panic room, Burnham, initially focused on cracking the safe, realizes the gravity of Sarah's medical emergency and, despite Raoul's impatience, administers the injection with Sarah's guidance, saving her life. Meanwhile, Meg, desperate and resourceful, arms herself with Raoul's dropped gun as the police arrive, complicating the already volatile hostage situation.
### Example Meta Summary 03
A home invasion escalates into a life-or-death crisis as mother Meg and daughter Sarah are trapped in a panic room while violent intruders Burnham, Harris, and Raoul terrorize their home. The situation becomes desperate when Sarah suffers a medical emergency requiring immediate intervention, forcing Meg to risk everything by leaving the safety of the panic room to retrieve medicine. In a series of brutal confrontations and deceptions involving switched identities and escalating violence, the characters are pushed to their breaking points, culminating in Meg becoming armed just as police arrive, transforming the home invasion into a complex hostage standoff where survival depends on split-second decisions.
--------------------------------
Now, Create a concise meta summary of the given previous summary referring the Example Input
Output pairs

## PREVIOUS_SUMMARY
${text}

## Guidelines:
- Write a meta summary of the PREVIOUS_SUMMARY.
- Focus on retention of key events, character traits, and interactions
- Aim for a word count of ${count}
- Follow the examples and try to retain the writing style of the original summary -- do not include phrases like "The Narrative"
"Write about the story directly, not about how the story is constructed"
"Discuss what happens in the story, not how the author tells it"
"Avoid phrases like 'the narrative,' 'the text,' 'the author,' or 'the story does'"
"Write as if the fictional world exists - describe events, characters, and situations directly"
- Start with immediate action or character focus, not contextual setup
- Use present tense active voice: "Characters do X" not "X is established" or "The story shows X"

## CRITICAL: 
Start your summary with immediate action or character focus. Write "Five tribes war over vibranium" not "The history of Wakanda is established." Use present tense active voice throughout.
## Output Format:
### Meta Summary
[Your meta summary here]
`
}