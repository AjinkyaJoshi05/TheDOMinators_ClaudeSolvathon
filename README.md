# The Signal Beneath Silence
## Dark Matter Particle Signature Classification Challenge ( Claude Solvathon )
Generates synthetic particle event datasets mimicking realistic detector responses. Classifies events into background or potential dark matter candidates. Provides human-like scientific reasoning explaining each classification. Suggests follow-up experiments or hypotheses for rare or novel events. The goal is not only accurate classification, but also explainable insights into dark matter detection.

#### Core Requirements / Tasks
###### 1. Data Simulation / Generation
Generate synthetic events using Claude, representing both background and dark matter interactions. Each event should include features such as: Recoil energy (keV), Scintillation light yield (S1), Ionization charge (S2), Pulse-shape descriptors, Detector position (x, y, z), Time-of-event. Simulate multiple particle types: WIMPs, axion-like particles, sterile neutrinos. Introduce realistic noise, missing values, and overlapping signals.

###### 2. Model / Reasoning Pipeline
Use Claude as the primary classifier and reasoning engine. Input: Tabular or summarized numerical features. Output: Event label (Background, WIMP-like, Axion-like, Sterile neutrino), Confidence score, Detailed reasoning for classification. Explore techniques like few-shot prompting, structured outputs, and embeddings to improve generalization.

###### 3. Explainability / Reporting
Generate human-readable explanations: Why the event is considered a candidate. Which features influenced the classification (energy levels, S1/S2 ratio, pulse shape). Possible follow-up experiments or data checks. References to relevant physics literature or known detector results.

###### 4. Adaptive Data Augmentation & Novelty Detection
Propose or generate new synthetic events beyond the training set to improve robustness. Flag novel anomalies in hidden test data, with reasoned hypotheses about potential physics interpretations.

###### 5. Optional Interface / Interaction
Integrate visualization dashboards or interactive prompts showing classification and reasoning. Demonstrate end-to-end pipeline from event simulation to reporting.
