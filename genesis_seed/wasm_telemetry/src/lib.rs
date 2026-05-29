use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct TelemetryEngine {
    vfe_score: f64,
    threat_heat: f64,
}

#[wasm_bindgen]
impl TelemetryEngine {
    #[wasm_bindgen(constructor)]
    pub fn new() -> TelemetryEngine {
        TelemetryEngine {
            vfe_score: 0.0,
            threat_heat: 0.0,
        }
    }

    pub fn process_tick(&mut self, delta: f64, swarm_load: f64) -> f64 {
        let noise = (delta * 100.0).sin();
        self.vfe_score = (self.vfe_score + noise + swarm_load * 0.1) * 0.95;
        self.threat_heat = self.threat_heat + if delta > 0.5 { delta * 10.0 } else { -1.0 };
        if self.threat_heat < 0.0 { self.threat_heat = 0.0; }
        if self.threat_heat > 100.0 { self.threat_heat = 100.0; }
        
        self.vfe_score
    }
    
    pub fn get_threat_heat(&self) -> f64 {
        self.threat_heat
    }
}
