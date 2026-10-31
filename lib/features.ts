/**
 * Recursos que podem ser ligados ou desligados por variável de ambiente.
 * Assistente de IA: desligado por padrão. Para ligar, defina AI_ENABLED=true e ANTHROPIC_API_KEY.
 */
export const AI_ENABLED = process.env.AI_ENABLED === "true";
