import React, { useState, useEffect, useRef } from 'react';
import tinycolor from 'tinycolor2';
import './ColorPicker.css';
import eyedropperIcon from './assets/eyedropper.png';

function ColorPicker() {
  const [color, setColor] = useState({
    h: 259, // Hue
    s: 88,  // Saturation
    l: 63,  // Lightness
    a: 1    // Alpha (opacity)
  });

  // Calculate derived values directly from the color state
  const tinyColorInstance = tinycolor(color);
  const hex = tinyColorInstance.toHexString().toUpperCase();
  const rgb = tinyColorInstance.toRgb();

  const saturationPanelRef = useRef(null);
  const isDragging = useRef(false);
  const [isEyeDropperSupported, setIsEyeDropperSupported] = useState(false);

  useEffect(() => {
    // Check if EyeDropper API is supported
    setIsEyeDropperSupported(typeof window !== 'undefined' && window.EyeDropper);
  }, []);

  const handleHueChange = (e) => {
    setColor(prev => ({ ...prev, h: parseInt(e.target.value) }));
  };

  const handleSaturationBrightnessMouseDown = (e) => {
    isDragging.current = true;
    handleSaturationBrightnessChange(e);
  };

  const handleSaturationBrightnessMouseMove = (e) => {
    if (isDragging.current) {
      handleSaturationBrightnessChange(e);
    }
  };

  const handleSaturationBrightnessMouseUp = () => {
    isDragging.current = false;
  };

  const handleSaturationBrightnessTouchStart = (e) => {
    isDragging.current = true;
    handleSaturationBrightnessChange(e.touches[0]);
  };

  const handleSaturationBrightnessTouchMove = (e) => {
    if (isDragging.current) {
      e.preventDefault();
      handleSaturationBrightnessChange(e.touches[0]);
    }
  };

  const handleSaturationBrightnessTouchEnd = () => {
    isDragging.current = false;
  };

  const handleSaturationBrightnessChange = (e) => {
    if (!saturationPanelRef.current) return;
    
    const { width, height, left, top } = saturationPanelRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    // Ensure values are within bounds
    const saturation = Math.min(100, Math.max(0, (x / width) * 100));
    const lightness = Math.min(100, Math.max(0, 100 - (y / height) * 100));

    setColor(prev => ({ ...prev, s: saturation, l: lightness }));
  };

  const handleHexChange = (e) => {
    const newHex = e.target.value.toUpperCase();
    // Validate and update color if it's a valid hex
    if (tinycolor(newHex).isValid()) {
      const newColor = tinycolor(newHex).toHsl();
      setColor({
        h: newColor.h,
        s: newColor.s * 100,
        l: newColor.l * 100,
        a: newColor.a
      });
    }
  };

  const handleRgbChange = (channel, value) => {
    const newRgb = { ...rgb, [channel]: parseInt(value) || 0 };
    const newColor = tinycolor(newRgb).toHsl();
    setColor({
      h: newColor.h,
      s: newColor.s * 100,
      l: newColor.l * 100,
      a: newColor.a
    });
  };

  const openEyeDropper = async () => {
    if (!isEyeDropperSupported) {
      alert("Your browser doesn't support the EyeDropper API. Try using Chrome, Edge, or another Chromium-based browser.");
      return;
    }
    try {
      const eyeDropper = new window.EyeDropper();
      const { sRGBHex } = await eyeDropper.open();
      const newColor = tinycolor(sRGBHex);
      setColor(newColor.toHsl());
    } catch (error) {
      // User canceled the selection
      console.log(error);
    }
  };

  // Predefined color swatches
  const colorSwatches = [
    '#FFFFFF', '#FFD1DC', '#E0BBE4', '#95E1D3', '#FCE77D', '#F8F8F8', '#E0E0E0', '#CCCCCC'
  ];

  const selectSwatch = (swatchColor) => {
    const newColor = tinycolor(swatchColor).toHsl();
    setColor({
      h: newColor.h,
      s: newColor.s * 100,
      l: newColor.l * 100,
      a: newColor.a
    });
  };

  useEffect(() => {
    // Add mouse event listeners
    document.addEventListener('mousemove', handleSaturationBrightnessMouseMove);
    document.addEventListener('mouseup', handleSaturationBrightnessMouseUp);
    
    // Add touch event listeners
    document.addEventListener('touchmove', handleSaturationBrightnessTouchMove, { passive: false });
    document.addEventListener('touchend', handleSaturationBrightnessTouchEnd);
    
    return () => {
      // Remove mouse event listeners
      document.removeEventListener('mousemove', handleSaturationBrightnessMouseMove);
      document.removeEventListener('mouseup', handleSaturationBrightnessMouseUp);
      
      // Remove touch event listeners
      document.removeEventListener('touchmove', handleSaturationBrightnessTouchMove);
      document.removeEventListener('touchend', handleSaturationBrightnessTouchEnd);
    };
  }, []);

  return (
    <div className="color-picker-widget" style={{ '--selected-color': hex }}>
      {/* Top Section: Color Selection Panel */}
      <div 
        className="color-selection-panel"
        style={{ backgroundColor: `hsl(${color.h}, 100%, 50%)` }}
        onMouseDown={handleSaturationBrightnessMouseDown}
        onTouchStart={handleSaturationBrightnessTouchStart}
        ref={saturationPanelRef}
      >
        <div className="saturation-white-gradient" />
        <div className="saturation-black-gradient" />
        <div 
          className="picker-handle" 
          style={{ 
            left: `${color.s}%`, 
            top: `${100 - color.l}%` 
          }} 
        />
      </div>
      
      {/* Bottom Section: Controls Area */}
      <div className="controls-area">
        {/* Row 1: Eyedropper, Hue Slider, and Swatches */}
        <div className="controls-row">
          <button 
            onClick={openEyeDropper} 
            className="eyedropper-button"
            style={{ backgroundColor: hex }}
            disabled={!isEyeDropperSupported}
          >
            <img src={eyedropperIcon} alt="Eyedropper" className="eyedropper-icon" />
          </button>
          
          <div className="right-controls">
            <input
              type="range"
              min="0"
              max="360"
              value={color.h}
              onChange={handleHueChange}
              className="hue-slider"
            />
            
            <div className="color-swatches">
              {colorSwatches.map((swatch, index) => (
                <div
                  key={index}
                  className="swatch"
                  style={{ backgroundColor: swatch }}
                  onClick={() => selectSwatch(swatch)}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Row 2: Color Value Inputs */}
        <div className="controls-row">
          <div className="color-inputs">
            <div className="input-group hex-group">
              <label>HEX</label>
              <input
                type="text"
                value={hex}
                onChange={handleHexChange}
                className="color-input hex-input"
              />
            </div>
            
            <div className="spacer"></div>
            
            <div className="input-group rgb-group">
              <label>R</label>
              <input
                type="number"
                min="0"
                max="255"
                value={rgb.r}
                onChange={(e) => handleRgbChange('r', e.target.value)}
                className="color-input rgb-input"
              />
            </div>
            
            <div className="input-group rgb-group">
              <label>G</label>
              <input
                type="number"
                min="0"
                max="255"
                value={rgb.g}
                onChange={(e) => handleRgbChange('g', e.target.value)}
                className="color-input rgb-input"
              />
            </div>
            
            <div className="input-group rgb-group">
              <label>B</label>
              <input
                type="number"
                min="0"
                max="255"
                value={rgb.b}
                onChange={(e) => handleRgbChange('b', e.target.value)}
                className="color-input rgb-input"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ColorPicker;