import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

const SYSTEM_INSTRUCTION = `
Você é um secretário executivo especialista em redigir atas de reunião formais e claras em Português do Brasil.
Sua tarefa é analisar a transcrição fornecida e criar um documento HTML estruturado.

ESTRUTURA E FORMATAÇÃO OBRIGATÓRIA:

1. CONFIGURAÇÃO GERAL (CSS Inline):
   - Fonte: "Times New Roman", Times, serif.
   - Tamanho: 12pt.
   - Texto justificado.
   - Envolva todo o conteúdo em uma div com esses estilos.

2. CONTEÚDO:

   A. CABEÇALHO:
      - Título da Reunião (Centralizado, Negrito).
      - Data, Hora e Local.
      - Membros Presentes.

   B. PAUTA DA REUNIÃO (AGENDA):
      - Lista ordenada usando LETRAS (a, b, c...).
      - Use a tag HTML <ol type="a">.

   C. DISCUSSÕES (DESENVOLVIMENTO):
      - Para cada item da pauta, um resumo do que foi discutido.
      - IMPORTANTE: Cada tópico deve ter um TÍTULO EM NEGRITO indicando o assunto.

   D. ENCAMINHAMENTOS (TABELA):
      - Colunas: "Ação/Encaminhamento", "Responsável", "Prazo".
      - Bordas: Simples, preta (1px).

REGRAS HTML:
- NÃO use tags <html>, <head> ou <body>. Retorne apenas o conteúdo interno.
- Estilize a tabela com 'border="1" style="border-collapse: collapse; width: 100%; margin-top: 1rem; border: 1px solid black;"'.
- Estilize th e td com 'padding: 8px; border: 1px solid black; text-align: left;'.
- Use tags semânticas: <h1>, <h2>, <ol type="a">, <li>, <p>, <strong>.
`;

export const generateMinutesFromTranscript = async (transcript: string): Promise<string> => {
  const ai = getClient();
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Por favor, gere uma ata de reunião baseada na seguinte transcrição, seguindo rigorosamente a formatação Times New Roman 12 e pauta com letras:\n\n${transcript}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3, 
      }
    });

    return response.text || "<p>Erro ao gerar o conteúdo.</p>";
  } catch (error) {
    console.error("Error generating minutes:", error);
    throw error;
  }
};

export const refineMinutes = async (currentHtml: string, userInstruction: string): Promise<string> => {
  const ai = getClient();

  const REFINE_INSTRUCTION = `
    Você é um assistente de edição. O usuário quer alterar uma ata de reunião existente.
    Você receberá o HTML atual da ata e uma instrução de mudança.
    Retorne APENAS o HTML atualizado, mantendo a estrutura e formatação originais (Times New Roman 12pt, Pauta com letras) onde não houver mudanças.
    Não adicione markdown fences (\`\`\`html).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: `DOCUMENTO ATUAL (HTML):\n${currentHtml}` },
            { text: `SOLICITAÇÃO DE MUDANÇA: ${userInstruction}` }
          ]
        }
      ],
      config: {
        systemInstruction: REFINE_INSTRUCTION,
      }
    });

    let text = response.text || currentHtml;
    // Remove markdown code blocks if the model accidentally adds them
    text = text.replace(/^```html\s*/, '').replace(/```$/, '');
    return text;
  } catch (error) {
    console.error("Error refining minutes:", error);
    throw error;
  }
};