from vocabulary.models import Stage
stages_data = {
    'introduction': {'next_stage': 'active_recall', 'interactions_needed': 1},
    'active_recall': {'next_stage': 'consolidation', 'interactions_needed': 3},
    'consolidation': {'next_stage': 'spaced_repetition', 'interactions_needed': 5},
    'spaced_repetition': {'next_stage': 'active_usage', 'interactions_needed': 7},
    'active_usage': {'next_stage': None, 'interactions_needed': 10},
}
for name, data in stages_data.items():
    next_stage = Stage.objects.get(name=data['next_stage']) if data['next_stage'] else None
    Stage.objects.create(name=name, next_stage=next_stage, interactions_needed=data['interactions_needed'])