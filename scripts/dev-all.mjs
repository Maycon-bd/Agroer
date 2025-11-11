import { spawn } from 'child_process';
import { resolve } from 'path';

function startProc(name, cmd, args, cwd) {
  console.log(`▶️  Iniciando ${name} em ${cwd}...`);
  const child = spawn(cmd, args, {
    cwd: resolve(cwd),
    shell: true,
    stdio: 'inherit',
    env: process.env,
  });
  child.on('exit', (code) => {
    console.log(`⏹️  ${name} finalizado com código ${code}`);
  });
  child.on('error', (err) => {
    console.error(`❌ Erro ao iniciar ${name}:`, err);
  });
  return child;
}

// Iniciar agentes em paralelo (modo dev com nodemon)
const a1 = startProc('Agente1', 'npm', ['run', 'dev'], './agente1');
const a2 = startProc('Agente2', 'npm', ['run', 'dev'], './agente2');
const a3 = startProc('Agente3', 'npm', ['run', 'dev'], './agente3');

// Iniciar frontend (bloqueante)
const fe = startProc('Frontend', 'npm', ['run', 'dev'], '.');

// Manter processo vivo enquanto o frontend estiver rodando
fe.on('exit', (code) => {
  console.log(`ℹ️ Frontend encerrado (código ${code}). Você pode encerrar agentes manualmente se necessário.`);
  // Não encerramos agentes automaticamente para permitir inspeção de logs.
});