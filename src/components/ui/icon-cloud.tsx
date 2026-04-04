"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { renderToString } from "react-dom/server";

type IconPosition = {
  x: number;
  y: number;
  z: number;
  id: number;
};

type IconCloudProps = {
  icons?: React.ReactNode[];
  images?: string[];
  size?: number;
};

function easeOutCubic(value: number) {
  return 1 - (1 - value) ** 3;
}

export function IconCloud({ icons, images, size = 400 }: IconCloudProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const rotationRef = useRef({ x: -0.18, y: 0.35 });
  const iconCanvasesRef = useRef<HTMLCanvasElement[]>([]);
  const imagesLoadedRef = useRef<boolean[]>([]);

  const [iconPositions, setIconPositions] = useState<IconPosition[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [targetRotation, setTargetRotation] = useState<{
    x: number;
    y: number;
    startX: number;
    startY: number;
    startTime: number;
    duration: number;
  } | null>(null);

  useEffect(() => {
    if (!icons && !images) {
      return;
    }

    const items = icons ?? images ?? [];
    imagesLoadedRef.current = new Array(items.length).fill(false);

    const nextCanvases = items.map((item, index) => {
      const offscreen = document.createElement("canvas");
      offscreen.width = 52;
      offscreen.height = 52;
      const context = offscreen.getContext("2d");

      if (!context) {
        return offscreen;
      }

      if (images) {
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.src = items[index] as string;
        image.onload = () => {
          context.clearRect(0, 0, offscreen.width, offscreen.height);
          context.beginPath();
          context.arc(26, 26, 26, 0, Math.PI * 2);
          context.closePath();
          context.clip();
          context.drawImage(image, 0, 0, 52, 52);
          imagesLoadedRef.current[index] = true;
        };

        return offscreen;
      }

      context.scale(0.52, 0.52);
      const svgString = renderToString(item as React.ReactElement);
      const image = new Image();
      image.src = `data:image/svg+xml;base64,${btoa(svgString)}`;
      image.onload = () => {
        context.clearRect(0, 0, offscreen.width, offscreen.height);
        context.drawImage(image, 0, 0);
        imagesLoadedRef.current[index] = true;
      };

      return offscreen;
    });

    iconCanvasesRef.current = nextCanvases;
  }, [icons, images]);

  useEffect(() => {
    const items = icons ?? images ?? [];
    const nextIcons: IconPosition[] = [];
    const count = items.length || 20;
    const offset = 2 / count;
    const increment = Math.PI * (3 - Math.sqrt(5));

    for (let index = 0; index < count; index += 1) {
      const y = index * offset - 1 + offset / 2;
      const radius = Math.sqrt(1 - y * y);
      const phi = index * increment;
      const x = Math.cos(phi) * radius;
      const z = Math.sin(phi) * radius;

      nextIcons.push({
        x: x * 110,
        y: y * 110,
        z: z * 110,
        id: index,
      });
    }

    setIconPositions(nextIcons);
  }, [icons, images]);

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    const canvas = canvasRef.current;
    if (!rect || !canvas) {
      return;
    }

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    for (const icon of iconPositions) {
      const cosX = Math.cos(rotationRef.current.x);
      const sinX = Math.sin(rotationRef.current.x);
      const cosY = Math.cos(rotationRef.current.y);
      const sinY = Math.sin(rotationRef.current.y);

      const rotatedX = icon.x * cosY - icon.z * sinY;
      const rotatedZ = icon.x * sinY + icon.z * cosY;
      const rotatedY = icon.y * cosX + rotatedZ * sinX;
      const scale = (rotatedZ + 240) / 360;
      const screenX = canvas.width / 2 + rotatedX;
      const screenY = canvas.height / 2 + rotatedY;
      const radius = 24 * scale;
      const dx = x - screenX;
      const dy = y - screenY;

      if (dx * dx + dy * dy >= radius * radius) {
        continue;
      }

      const targetX = -Math.atan2(
        icon.y,
        Math.sqrt(icon.x * icon.x + icon.z * icon.z),
      );
      const targetY = Math.atan2(icon.x, icon.z);
      const currentX = rotationRef.current.x;
      const currentY = rotationRef.current.y;
      const distance = Math.sqrt(
        (targetX - currentX) ** 2 + (targetY - currentY) ** 2,
      );

      setTargetRotation({
        x: targetX,
        y: targetY,
        startX: currentX,
        startY: currentY,
        startTime: performance.now(),
        duration: Math.min(2000, Math.max(800, distance * 1000)),
      });
      return;
    }

    setIsDragging(true);
    setLastMousePos({ x: event.clientX, y: event.clientY });
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setMousePos({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    }

    if (!isDragging) {
      return;
    }

    const deltaX = event.clientX - lastMousePos.x;
    const deltaY = event.clientY - lastMousePos.y;
    rotationRef.current = {
      x: rotationRef.current.x + deltaY * 0.002,
      y: rotationRef.current.y + deltaX * 0.002,
    };
    setLastMousePos({ x: event.clientX, y: event.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) {
      return;
    }

    const animate = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
      const dx = mousePos.x - centerX;
      const dy = mousePos.y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const speed = 0.0025 + (distance / maxDistance) * 0.008;

      if (targetRotation) {
        const elapsed = performance.now() - targetRotation.startTime;
        const progress = Math.min(1, elapsed / targetRotation.duration);
        const eased = easeOutCubic(progress);

        rotationRef.current = {
          x:
            targetRotation.startX +
            (targetRotation.x - targetRotation.startX) * eased,
          y:
            targetRotation.startY +
            (targetRotation.y - targetRotation.startY) * eased,
        };

        if (progress >= 1) {
          setTargetRotation(null);
        }
      } else if (!isDragging) {
        rotationRef.current = {
          x: rotationRef.current.x + (dy / canvas.height) * speed,
          y: rotationRef.current.y + (dx / canvas.width) * speed,
        };
      }

      const sortedIcons = [...iconPositions].sort((a, b) => a.z - b.z);

      sortedIcons.forEach((icon, index) => {
        const cosX = Math.cos(rotationRef.current.x);
        const sinX = Math.sin(rotationRef.current.x);
        const cosY = Math.cos(rotationRef.current.y);
        const sinY = Math.sin(rotationRef.current.y);

        const rotatedX = icon.x * cosY - icon.z * sinY;
        const rotatedZ = icon.x * sinY + icon.z * cosY;
        const rotatedY = icon.y * cosX + rotatedZ * sinX;
        const scale = (rotatedZ + 240) / 360;
        const opacity = Math.max(0.22, Math.min(1, (rotatedZ + 180) / 250));

        context.save();
        context.translate(centerX + rotatedX, centerY + rotatedY);
        context.scale(scale, scale);
        context.globalAlpha = opacity;

        const sourceCanvas = iconCanvasesRef.current[icon.id];
        if (sourceCanvas && imagesLoadedRef.current[icon.id]) {
          context.drawImage(sourceCanvas, -26, -26, 52, 52);
        } else {
          context.beginPath();
          context.arc(0, 0, 22, 0, Math.PI * 2);
          context.fillStyle = "rgba(76, 157, 243, 0.7)";
          context.fill();
          context.fillStyle = "white";
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.font = "14px sans-serif";
          context.fillText(String(index + 1), 0, 0);
        }

        context.restore();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [iconPositions, isDragging, mousePos, targetRotation]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="size-full"
      aria-label="Interactive 3D icon cloud"
      role="img"
    />
  );
}
