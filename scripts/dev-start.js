#!/usr/bin/env node
/**
 * Suriname 개발 환경 자동 시작 스크립트
 * 포트 충돌 체크 → 자동 해결 → 서버 시작
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const PortManager = require('./port-manager');

class DevStarter {
  constructor() {
    this.portManager = new PortManager();
    this.processes = [];
    this.isWindows = process.platform === 'win32';
  }

  /**
   * 개발 환경 시작
   */
  async start() {
    console.log('🚀 Suriname 개발 환경 시작 중...\n');

    try {
      // 1. 포트 상태 확인 및 자동 해결
      console.log('1️⃣ 포트 충돌 체크 및 해결...');
      const { backendPort, frontendPort } = await this.portManager.autoResolve();
      
      // 2. 백엔드 시작
      console.log('\n2️⃣ Spring Boot 백엔드 시작...');
      await this.startBackend();
      
      // 3. 프론트엔드 시작 (백엔드 시작 후 3초 대기)
      setTimeout(async () => {
        console.log('\n3️⃣ React 프론트엔드 시작...');
        await this.startFrontend();
        
        // 4. 브라우저 자동 열기
        setTimeout(() => {
          console.log('\n✅ 개발 환경 시작 완료!');
          console.log(`Backend: http://localhost:${backendPort}`);
          console.log(`Frontend: http://localhost:${frontendPort}`);
          console.log('\n종료하려면 Ctrl+C를 누르세요.\n');
          
          this.openBrowser(`http://localhost:${frontendPort}`);
        }, 2000);
        
      }, 3000);
      
    } catch (error) {
      console.error('❌ 개발 환경 시작 실패:', error.message);
      this.cleanup();
    }
  }

  /**
   * Spring Boot 백엔드 시작
   */
  async startBackend() {
    return new Promise((resolve, reject) => {
      const backendDir = path.join(__dirname, '../suriname-backend');
      const command = this.isWindows ? 'gradlew.bat' : './gradlew';
      
      const backend = spawn(command, ['bootRun'], {
        cwd: backendDir,
        stdio: ['inherit', 'pipe', 'pipe'],
        shell: true
      });

      backend.stdout.on('data', (data) => {
        const output = data.toString();
        process.stdout.write(`[BACKEND] ${output}`);
        
        // Spring Boot 시작 완료 감지
        if (output.includes('Started SurinameApplication') || 
            output.includes('Tomcat started on port')) {
          console.log('✅ 백엔드 시작 완료');
          resolve();
        }
      });

      backend.stderr.on('data', (data) => {
        process.stderr.write(`[BACKEND ERROR] ${data}`);
      });

      backend.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`백엔드 프로세스 종료됨 (코드: ${code})`));
        }
      });

      this.processes.push(backend);
    });
  }

  /**
   * React 프론트엔드 시작
   */
  async startFrontend() {
    const frontendDir = path.join(__dirname, '../suriname-frontend');
    const command = this.isWindows ? 'npm.cmd' : 'npm';
    
    const frontend = spawn(command, ['run', 'dev'], {
      cwd: frontendDir,
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: true
    });

    frontend.stdout.on('data', (data) => {
      const output = data.toString();
      process.stdout.write(`[FRONTEND] ${output}`);
    });

    frontend.stderr.on('data', (data) => {
      process.stderr.write(`[FRONTEND ERROR] ${data}`);
    });

    frontend.on('close', (code) => {
      console.log(`프론트엔드 프로세스 종료됨 (코드: ${code})`);
    });

    this.processes.push(frontend);
  }

  /**
   * 브라우저 자동 열기
   */
  openBrowser(url) {
    const command = this.isWindows ? 'start' : 
                   process.platform === 'darwin' ? 'open' : 'xdg-open';
    
    exec(`${command} ${url}`, (error) => {
      if (error) {
        console.log('브라우저 자동 열기 실패. 수동으로 열어주세요:', url);
      }
    });
  }

  /**
   * 프로세스 정리
   */
  cleanup() {
    console.log('\n🛑 개발 서버 종료 중...');
    
    this.processes.forEach((process) => {
      if (process && !process.killed) {
        process.kill('SIGTERM');
      }
    });
    
    setTimeout(() => {
      this.processes.forEach((process) => {
        if (process && !process.killed) {
          process.kill('SIGKILL');
        }
      });
    }, 5000);
  }
}

// Graceful shutdown 처리
process.on('SIGINT', () => {
  console.log('\n종료 신호 받음...');
  if (global.devStarter) {
    global.devStarter.cleanup();
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n종료 신호 받음...');
  if (global.devStarter) {
    global.devStarter.cleanup();
  }
  process.exit(0);
});

// CLI 실행
if (require.main === module) {
  const devStarter = new DevStarter();
  global.devStarter = devStarter;
  devStarter.start();
}

module.exports = DevStarter;