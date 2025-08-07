#!/usr/bin/env node
/**
 * Suriname 프로젝트 포트 관리 시스템
 * 포트 충돌 자동 감지 및 해결
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// 프로젝트 포트 설정
const PROJECT_PORTS = {
  backend: 8081,
  frontend: 5173,
  fallback: {
    backend: [8082, 8083, 8084],
    frontend: [5174, 5175, 5176]
  }
};

class PortManager {
  constructor() {
    this.isWindows = process.platform === 'win32';
  }

  /**
   * 포트 사용 여부 확인
   */
  async isPortInUse(port) {
    return new Promise((resolve) => {
      const command = this.isWindows 
        ? `netstat -an | grep :${port}`
        : `lsof -i:${port}`;
      
      exec(command, (error, stdout) => {
        resolve(stdout.length > 0);
      });
    });
  }

  /**
   * 사용 가능한 포트 찾기
   */
  async findAvailablePort(defaultPort, fallbacks) {
    if (!(await this.isPortInUse(defaultPort))) {
      return defaultPort;
    }

    console.warn(`⚠️ 포트 ${defaultPort} 사용 중, 대안 포트 탐색...`);
    
    for (const port of fallbacks) {
      if (!(await this.isPortInUse(port))) {
        console.log(`✅ 대안 포트 ${port} 사용 가능`);
        return port;
      }
    }
    
    throw new Error(`모든 포트가 사용 중입니다: [${defaultPort}, ${fallbacks.join(', ')}]`);
  }

  /**
   * 포트 충돌 프로세스 종료
   */
  async killPortProcess(port) {
    return new Promise((resolve, reject) => {
      const command = this.isWindows
        ? `for /f "tokens=5" %a in ('netstat -aon ^| grep :${port}') do taskkill /f /pid %a`
        : `lsof -ti:${port} | xargs kill -9`;

      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.log(`포트 ${port} 프로세스 종료 실패: ${error.message}`);
          reject(error);
        } else {
          console.log(`✅ 포트 ${port} 프로세스 종료 완료`);
          resolve();
        }
      });
    });
  }

  /**
   * 백엔드 설정 업데이트
   */
  updateBackendPort(port) {
    const configPath = path.join(__dirname, '../suriname-backend/src/main/resources/application.yml');
    
    try {
      let config = fs.readFileSync(configPath, 'utf8');
      config = config.replace(/port:\s*\d+/, `port: ${port}`);
      fs.writeFileSync(configPath, config);
      console.log(`✅ Backend 포트 ${port}로 업데이트`);
    } catch (error) {
      console.error(`Backend 설정 업데이트 실패: ${error.message}`);
    }
  }

  /**
   * 프론트엔드 설정 업데이트
   */
  updateFrontendPort(frontendPort, backendPort) {
    const configPath = path.join(__dirname, '../suriname-frontend/vite.config.js');
    
    try {
      let config = fs.readFileSync(configPath, 'utf8');
      
      // Proxy target 업데이트
      config = config.replace(
        /target:\s*['"`]http:\/\/localhost:\d+['"`]/,
        `target: 'http://localhost:${backendPort}'`
      );
      
      // Server port 추가 (필요시)
      if (!config.includes('port:')) {
        config = config.replace(
          /server:\s*{/,
          `server: {\n    port: ${frontendPort},`
        );
      } else {
        config = config.replace(/port:\s*\d+/, `port: ${frontendPort}`);
      }
      
      fs.writeFileSync(configPath, config);
      console.log(`✅ Frontend 포트 ${frontendPort}로 업데이트, Backend proxy ${backendPort}`);
    } catch (error) {
      console.error(`Frontend 설정 업데이트 실패: ${error.message}`);
    }
  }

  /**
   * 포트 상태 체크
   */
  async checkPortStatus() {
    console.log('\n📊 Suriname 프로젝트 포트 상태 확인...\n');
    
    const backendInUse = await this.isPortInUse(PROJECT_PORTS.backend);
    const frontendInUse = await this.isPortInUse(PROJECT_PORTS.frontend);
    
    console.log(`Backend (${PROJECT_PORTS.backend}): ${backendInUse ? '🔴 사용 중' : '🟢 사용 가능'}`);
    console.log(`Frontend (${PROJECT_PORTS.frontend}): ${frontendInUse ? '🔴 사용 중' : '🟢 사용 가능'}`);
    
    return { backendInUse, frontendInUse };
  }

  /**
   * 자동 포트 해결
   */
  async autoResolve(options = {}) {
    console.log('\n🚀 포트 충돌 자동 해결 시작...\n');
    
    try {
      // 백엔드 포트 확인 및 해결
      const backendPort = await this.findAvailablePort(
        PROJECT_PORTS.backend, 
        PROJECT_PORTS.fallback.backend
      );
      
      // 프론트엔드 포트 확인 및 해결  
      const frontendPort = await this.findAvailablePort(
        PROJECT_PORTS.frontend,
        PROJECT_PORTS.fallback.frontend
      );
      
      // 설정 파일 업데이트
      if (backendPort !== PROJECT_PORTS.backend) {
        this.updateBackendPort(backendPort);
      }
      
      if (frontendPort !== PROJECT_PORTS.frontend || backendPort !== PROJECT_PORTS.backend) {
        this.updateFrontendPort(frontendPort, backendPort);
      }
      
      console.log('\n✅ 포트 충돌 해결 완료!');
      console.log(`Backend: http://localhost:${backendPort}`);
      console.log(`Frontend: http://localhost:${frontendPort}`);
      
      return { backendPort, frontendPort };
      
    } catch (error) {
      console.error('\n❌ 포트 해결 실패:', error.message);
      throw error;
    }
  }

  /**
   * 강제 포트 정리
   */
  async forceCleanPorts() {
    console.log('\n🧹 포트 강제 정리 시작...\n');
    
    try {
      await this.killPortProcess(PROJECT_PORTS.backend);
      await this.killPortProcess(PROJECT_PORTS.frontend);
      
      // 1초 대기 후 상태 확인
      setTimeout(async () => {
        await this.checkPortStatus();
      }, 1000);
      
    } catch (error) {
      console.error('포트 정리 중 오류:', error.message);
    }
  }
}

// CLI 실행
if (require.main === module) {
  const portManager = new PortManager();
  const command = process.argv[2];
  
  switch (command) {
    case 'check':
      portManager.checkPortStatus();
      break;
      
    case 'resolve':
      portManager.autoResolve();
      break;
      
    case 'clean':
      portManager.forceCleanPorts();
      break;
      
    case 'kill':
      const port = process.argv[3];
      if (port) {
        portManager.killPortProcess(parseInt(port));
      } else {
        console.log('사용법: node port-manager.js kill <port>');
      }
      break;
      
    default:
      console.log(`
🔧 Suriname 포트 관리 도구

사용법:
  node port-manager.js check    - 포트 상태 확인
  node port-manager.js resolve  - 포트 충돌 자동 해결  
  node port-manager.js clean    - 모든 포트 강제 정리
  node port-manager.js kill <port> - 특정 포트 프로세스 종료

예시:
  npm run port:check
  npm run port:resolve
  npm run port:clean
      `);
  }
}

module.exports = PortManager;