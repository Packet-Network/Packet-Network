// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:8000';

test.describe('Packet Network E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    // Clear localStorage for fresh state
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    // Skip tutorial
    await page.evaluate(() => {
      if (typeof skipTutorial === 'function') skipTutorial();
    });
  });

  test.describe('Stage Selection', () => {
    
    test('should show stage selection modal on load', async ({ page }) => {
      const modal = page.locator('#stageSelectModal');
      await expect(modal).toBeVisible();
      
      // Check all 3 stages are present
      const stages = page.locator('.stage-card');
      await expect(stages).toHaveCount(3);
    });

    test('should start Stage 1 when clicked', async ({ page }) => {
      await page.locator('.stage-card').first().click();
      
      // Stage modal should close
      const modal = page.locator('#stageSelectModal');
      await expect(modal).not.toBeVisible();
      
      // Stage info should show
      const stageInfo = page.locator('#stageInfo');
      await expect(stageInfo).toBeVisible();
      
      // Internet device should be pre-placed
      const hasInternet = await page.evaluate(() => {
        return state.devices.some(d => d.type === 'internet');
      });
      expect(hasInternet).toBe(true);
    });
  });

  test.describe('Device Management', () => {
    
    test.beforeEach(async ({ page }) => {
      // Start Stage 1
      await page.locator('.stage-card').first().click();
    });

    test('should add device via drag and drop', async ({ page }) => {
      const pcBtn = page.locator('[data-device="pc"]');
      const canvas = page.locator('#gameCanvas');
      
      // Drag PC to canvas
      await pcBtn.dragTo(canvas, { targetPosition: { x: 400, y: 300 } });
      
      const pcCount = await page.evaluate(() => {
        return state.devices.filter(d => d.type === 'pc').length;
      });
      expect(pcCount).toBe(1);
    });

    test('should NOT delete fixed device (Internet)', async ({ page }) => {
      // Select delete tool
      await page.locator('[data-tool="delete"]').click();
      
      // Try to click on Internet device
      const internetPos = await page.evaluate(() => {
        const internet = state.devices.find(d => d.type === 'internet');
        return internet ? { x: internet.x, y: internet.y } : null;
      });
      
      expect(internetPos).not.toBeNull();
      
      // Click on Internet position
      const canvas = page.locator('#gameCanvas');
      const canvasBox = await canvas.boundingBox();
      await page.mouse.click(
        canvasBox.x + internetPos.x,
        canvasBox.y + internetPos.y
      );
      
      // Internet should still exist
      const hasInternet = await page.evaluate(() => {
        return state.devices.some(d => d.type === 'internet');
      });
      expect(hasInternet).toBe(true);
    });

    test('should delete non-fixed device', async ({ page }) => {
      // Add a PC
      await page.evaluate(() => {
        addDevice('pc', 400, 300);
        updateUI();
        draw();
      });
      
      // Select delete tool
      await page.locator('[data-tool="delete"]').click();
      
      // Click on PC
      const canvas = page.locator('#gameCanvas');
      const canvasBox = await canvas.boundingBox();
      await page.mouse.click(canvasBox.x + 400, canvasBox.y + 300);
      
      // PC should be deleted
      const pcCount = await page.evaluate(() => {
        return state.devices.filter(d => d.type === 'pc').length;
      });
      expect(pcCount).toBe(0);
    });
  });

  test.describe('Cable Management', () => {
    
    test.beforeEach(async ({ page }) => {
      await page.locator('.stage-card').first().click();
      // Add devices
      await page.evaluate(() => {
        addDevice('router', 350, 250);
        addDevice('pc', 500, 250);
        updateUI();
        draw();
      });
    });

    test('should create cable between devices', async ({ page }) => {
      await page.evaluate(() => {
        addLink(1, 2); // Internet to Router
        updateUI();
        draw();
      });
      
      const linkCount = await page.evaluate(() => state.links.length);
      expect(linkCount).toBe(1);
    });

    test('should calculate cable length correctly', async ({ page }) => {
      await page.evaluate(() => {
        addLink(2, 3); // Router to PC (150px apart = 15m)
        updateUI();
        draw();
      });
      
      const cableLength = await page.evaluate(() => state.links[0].length);
      expect(cableLength).toBe(15); // 150px * 0.1 = 15m
    });

    test('should recalculate cable length when device is moved', async ({ page }) => {
      // Create link
      await page.evaluate(() => {
        addLink(2, 3);
        updateUI();
        draw();
      });
      
      const initialLength = await page.evaluate(() => state.links[0].length);
      
      // Move PC closer
      await page.evaluate(() => {
        const pc = state.devices.find(d => d.type === 'pc');
        pc.x = 400; // Move closer to router at 350
        recalculateCableLengths();
        updateUI();
        draw();
      });
      
      const newLength = await page.evaluate(() => state.links[0].length);
      expect(newLength).toBeLessThan(initialLength);
    });

    test('should delete cable with delete tool', async ({ page }) => {
      // Create link
      await page.evaluate(() => {
        addLink(2, 3);
        updateUI();
        draw();
      });
      
      // Select delete tool
      await page.locator('[data-tool="delete"]').click();
      
      // Click on cable (midpoint between router and PC)
      const canvas = page.locator('#gameCanvas');
      const canvasBox = await canvas.boundingBox();
      await page.mouse.click(canvasBox.x + 425, canvasBox.y + 250);
      
      const linkCount = await page.evaluate(() => state.links.length);
      expect(linkCount).toBe(0);
    });

    test('should mark cable as degraded when over 100m (Cat6)', async ({ page }) => {
      // Create a long cable
      await page.evaluate(() => {
        // Move PC far away (110m = 1100px from router)
        const pc = state.devices.find(d => d.type === 'pc');
        pc.x = 1450; // 1100px from router at 350 = 110m
        addLink(2, 3);
        updateUI();
        draw();
      });
      
      const isDegraded = await page.evaluate(() => state.links[0].degraded);
      expect(isDegraded).toBe(true);
      
      const actualSpeed = await page.evaluate(() => state.links[0].actualSpeed);
      expect(actualSpeed).toBeLessThan(1000); // Less than 1Gbps
    });
  });

  test.describe('Evaluation', () => {
    
    test('should pass Stage 1 with valid network', async ({ page }) => {
      await page.locator('.stage-card').first().click();
      
      // Build valid network
      await page.evaluate(() => {
        addDevice('router', 300, 250);
        addDevice('pc', 400, 150);
        addDevice('pc', 400, 250);
        addDevice('pc', 400, 350);
        addLink(1, 2); // Internet to Router
        addLink(2, 3); // Router to PC1
        addLink(2, 4); // Router to PC2
        addLink(2, 5); // Router to PC3
        updateUI();
        draw();
      });
      
      // Click evaluate
      await page.locator('#checkBtn').click();
      
      // Result modal should show
      const resultModal = page.locator('#resultModal');
      await expect(resultModal).toBeVisible();
      
      // Should have passing score (60+)
      const total = await page.evaluate(() => lastEvalResult.total);
      expect(total).toBeGreaterThanOrEqual(60);
      
      // Next stage button should be visible
      const nextBtn = page.locator('#nextStageBtn');
      await expect(nextBtn).toBeVisible();
    });

    test('should show reduced speed score for long cables', async ({ page }) => {
      await page.locator('.stage-card').first().click();
      
      // Build network with very long cable (>100m = >1000px)
      await page.evaluate(() => {
        addDevice('router', 1200, 250); // Very far from Internet at ~100
        addDevice('pc', 1300, 150);
        addDevice('pc', 1300, 250);
        addDevice('pc', 1300, 350);
        addLink(1, 2); // This cable will be >100m
        addLink(2, 3);
        addLink(2, 4);
        addLink(2, 5);
        updateUI();
        draw();
      });
      
      await page.locator('#checkBtn').click();
      
      const speedScore = await page.evaluate(() => lastEvalResult.speed);
      expect(speedScore).toBeLessThan(100); // Should be penalized
    });
  });

  test.describe('Timer', () => {
    
    test('should start timer when stage begins', async ({ page }) => {
      await page.locator('.stage-card').first().click();
      
      // Wait a bit
      await page.waitForTimeout(1000);
      
      const elapsed = await page.evaluate(() => state.elapsedTime);
      expect(elapsed).toBeGreaterThan(0);
    });

    test('should stop timer on evaluation', async ({ page }) => {
      await page.locator('.stage-card').first().click();
      
      await page.evaluate(() => {
        addDevice('router', 300, 250);
        addDevice('pc', 400, 150);
        addDevice('pc', 400, 250);
        addDevice('pc', 400, 350);
        addLink(1, 2);
        addLink(2, 3);
        addLink(2, 4);
        addLink(2, 5);
        updateUI();
        draw();
      });
      
      await page.locator('#checkBtn').click();
      
      const timeAfterEval = await page.evaluate(() => state.elapsedTime);
      await page.waitForTimeout(500);
      const timeAfterWait = await page.evaluate(() => state.elapsedTime);
      
      // Timer should have stopped (same value)
      expect(timeAfterEval).toBe(timeAfterWait);
    });
  });

  test.describe('Language', () => {
    
    test('should default to Japanese', async ({ page }) => {
      const lang = await page.evaluate(() => currentLang);
      expect(lang).toBe('ja');
    });

    test('should toggle language', async ({ page }) => {
      // Close stage modal first
      await page.locator('.stage-card').first().click();
      
      await page.locator('.lang-btn').click();
      
      const lang = await page.evaluate(() => currentLang);
      expect(lang).toBe('en');
    });
  });

});
