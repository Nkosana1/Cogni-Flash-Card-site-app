# Card Types Documentation

## Overview

NeuroFlash supports 5 different card types, each optimized for different learning scenarios:

1. **BASIC** - Traditional front/back cards
2. **CLOZE** - Fill-in-the-blank deletion cards
3. **IMAGE_OCCLUSION** - Hide parts of images for learning
4. **REVERSE** - Automatically generated reverse cards
5. **MULTIPLE_CHOICE** - Auto-generated multiple choice questions

---

## 1. BASIC Cards

Traditional front/back flashcard format.

### Example

**Request:**
```json
POST /api/cards/decks/1/cards
{
  "front_content": "What is the capital of France?",
  "back_content": "Paris",
  "card_type": "basic"
}
```

**Response:**
```json
{
  "id": 1,
  "deck_id": 1,
  "front_content": "What is the capital of France?",
  "back_content": "Paris",
  "card_type": "basic",
  "card_data": {},
  "created_at": "2024-01-01T00:00:00"
}
```

---

## 2. CLOZE Cards

Fill-in-the-blank cards using cloze deletion syntax.

### Syntax

- `{{c1::hidden text}}` - Basic cloze deletion
- `{{c1::hidden text::hint}}` - Cloze deletion with hint
- Multiple deletions: `{{c1::first}} and {{c2::second}}`

### Example

**Request:**
```json
POST /api/cards/decks/1/cards
{
  "front_content": "The {{c1::capital}} of France is {{c2::Paris::hint: city name}}.",
  "card_type": "cloze"
}
```

**Get Card Views:**
```json
GET /api/cards/1/views

{
  "card_id": 1,
  "card_type": "cloze",
  "views": [
    {
      "cloze_index": 1,
      "front": "The [...] of France is Paris.",
      "back": "capital",
      "hint": null,
      "full_text": "The {{c1::capital}} of France is {{c2::Paris::hint: city name}}."
    },
    {
      "cloze_index": 2,
      "front": "The capital of France is [...].",
      "back": "Paris",
      "hint": "city name",
      "full_text": "The {{c1::capital}} of France is {{c2::Paris::hint: city name}}."
    }
  ]
}
```

### Cloze Service Usage

```python
from app.services.cloze_card import ClozeCardService

# Parse cloze text
text = "The {{c1::capital}} of France is {{c2::Paris}}."
deletions = ClozeCardService.parse_cloze_text(text)
# Returns: [{'index': 1, 'text': 'capital', ...}, {'index': 2, 'text': 'Paris', ...}]

# Validate syntax
is_valid, error = ClozeCardService.validate_cloze_syntax(text)
# Returns: (True, None) if valid

# Render with one deletion shown
rendered = ClozeCardService.render_cloze_text(text, show_index=1)
# Returns: "The capital of France is [...]."
```

---

## 3. IMAGE_OCCLUSION Cards

Cards that hide specific regions of images for learning.

### Example

**Request:**
```json
POST /api/cards/decks/1/cards
{
  "front_content": "Identify the occluded region",
  "back_content": "Region label",
  "card_type": "image_occlusion",
  "card_data": {
    "image": {
      "url": "https://example.com/image.jpg",
      "width": 800,
      "height": 600
    },
    "regions": [
      {
        "x": 0.2,
        "y": 0.3,
        "width": 0.3,
        "height": 0.2,
        "label": "Nucleus",
        "hint": "Cell organelle"
      },
      {
        "x": 0.5,
        "y": 0.4,
        "width": 0.2,
        "height": 0.15,
        "label": "Mitochondria"
      }
    ]
  }
}
```

**Get Card Views:**
```json
GET /api/cards/2/views

{
  "card_id": 2,
  "card_type": "image_occlusion",
  "views": [
    {
      "region_id": 1,
      "region_label": "Nucleus",
      "front": {
        "image_url": "https://example.com/image.jpg",
        "occluded_region": {
          "x": 0.2,
          "y": 0.3,
          "width": 0.3,
          "height": 0.2
        }
      },
      "back": {
        "label": "Nucleus",
        "hint": "Cell organelle"
      }
    },
    {
      "region_id": 2,
      "region_label": "Mitochondria",
      "front": {
        "image_url": "https://example.com/image.jpg",
        "occluded_region": {
          "x": 0.5,
          "y": 0.4,
          "width": 0.2,
          "height": 0.15
        }
      },
      "back": {
        "label": "Mitochondria",
        "hint": null
      }
    }
  ]
}
```

### Image Occlusion Service Usage

```python
from app.services.image_occlusion import ImageOcclusionService

# Process image with regions
image_data = {
    "url": "https://example.com/image.jpg",
    "width": 800,
    "height": 600
}

regions = [
    {
        "x": 0.2,
        "y": 0.3,
        "width": 0.3,
        "height": 0.2,
        "label": "Nucleus"
    }
]

processed = ImageOcclusionService.process_image_upload(image_data, regions)

# Get occluded image
occluded = ImageOcclusionService.get_occluded_image(card, region_index=1)
```

---

## 4. REVERSE Cards

Automatically generated cards with front and back swapped.

### Example

**Generate Reverse Card:**
```json
POST /api/cards/1/reverse

{
  "message": "Reverse card created",
  "card": {
    "id": 3,
    "deck_id": 1,
    "front_content": "Paris",
    "back_content": "What is the capital of France?",
    "card_type": "reverse",
    "card_data": {
      "original_card_id": 1,
      "is_reverse": true
    }
  }
}
```

### Reverse Card Service Usage

```python
from app.services.card_generation import ReverseCardService

# Generate reverse card
reverse_card = ReverseCardService.generate_reverse_card(original_card)

# Create reverse pair
cards = ReverseCardService.create_reverse_pair(card)
# Returns: [original_card, reverse_card]
```

---

## 5. MULTIPLE_CHOICE Cards

Auto-generated multiple choice questions from basic cards.

### Example

**Generate Multiple Choice Cards:**
```json
POST /api/cards/decks/1/generate-multiple-choice
{
  "num_options": 4
}

{
  "message": "5 multiple choice cards created",
  "cards": [
    {
      "id": 4,
      "front_content": "What is the capital of France?",
      "back_content": "Paris",
      "card_type": "multiple_choice",
      "card_data": {
        "original_card_id": 1,
        "options": [
          {
            "index": 1,
            "text": "London",
            "is_correct": false
          },
          {
            "index": 2,
            "text": "Paris",
            "is_correct": true
          },
          {
            "index": 3,
            "text": "Berlin",
            "is_correct": false
          },
          {
            "index": 4,
            "text": "Madrid",
            "is_correct": false
          }
        ]
      }
    }
  ]
}
```

**Validate Answer:**
```python
from app.services.card_generation import MultipleChoiceService

# Check if answer is correct
is_correct = MultipleChoiceService.validate_answer(card, selected_index=2)
# Returns: True if option 2 is correct
```

---

## Card Templates

Custom HTML/CSS templates for card rendering.

### Example

```python
from app.services.card_template import CardTemplate, CardTemplateService

# Create custom template
template = CardTemplate(
    front_template='<div class="custom-front">{{front_content}}</div>',
    back_template='<div class="custom-back">{{back_content}}</div>',
    css_style='''
        .custom-front {
            background: #f0f0f0;
            padding: 20px;
        }
        .custom-back {
            background: #e0e0e0;
            padding: 20px;
        }
    '''
)

# Render card
html = CardTemplateService.render_card_html(card, template)
# Returns: {'front': '...', 'back': '...', 'style': '...'}

# Use default template for card type
html = CardTemplateService.render_card_html(card)
```

---

## Import/Export

### Export to JSON

```json
GET /api/cards/decks/1/export?format=json

{
  "deck": {
    "title": "My Deck",
    "description": "Description",
    "tags": ["tag1", "tag2"]
  },
  "cards": [
    {
      "id": 1,
      "front_content": "...",
      "back_content": "...",
      "card_type": "basic",
      ...
    }
  ],
  "total_cards": 10
}
```

### Export to CSV

```bash
GET /api/cards/decks/1/export?format=csv

# Returns CSV file download
Front,Back,Type,Media Attachments
"What is the capital of France?","Paris",basic,""
```

### Export to Anki Format

```json
GET /api/cards/decks/1/export?format=anki

{
  "cards": [
    {
      "Front": "What is the capital of France?",
      "Back": "Paris",
      "Tags": "tag1 tag2"
    }
  ]
}
```

### Import from JSON

```json
POST /api/cards/decks/1/import
{
  "format": "json",
  "data": {
    "cards": [
      {
        "front_content": "Question",
        "back_content": "Answer",
        "card_type": "basic"
      }
    ]
  }
}
```

### Import from CSV

```json
POST /api/cards/decks/1/import
{
  "format": "csv",
  "data": "Front,Back,Type\nQuestion,Answer,basic"
}
```

---

## Validation

Each card type has specific validation rules:

### BASIC
- Requires `front_content` and `back_content`

### CLOZE
- Requires valid cloze syntax in `front_content`
- Syntax: `{{c1::text}}` or `{{c1::text::hint}}`
- No nested markers

### IMAGE_OCCLUSION
- Requires `card_data` with `image` and `regions`
- Regions must have valid coordinates (0-1 normalized)
- At least one region required

### REVERSE
- Generated from BASIC cards
- Automatically swaps front/back

### MULTIPLE_CHOICE
- Requires `card_data.options` array
- Each option needs `text` and `is_correct`
- At least 2 options required

---

## Best Practices

1. **Cloze Cards:**
   - Use hints for difficult deletions
   - Number deletions sequentially (c1, c2, c3...)
   - Keep deletions concise

2. **Image Occlusion:**
   - Use high-quality images
   - Ensure regions don't overlap
   - Provide clear labels

3. **Multiple Choice:**
   - Use 4-5 options for best results
   - Ensure distractors are plausible
   - Mix up correct answer position

4. **Templates:**
   - Keep templates simple and readable
   - Use CSS for styling, not inline styles
   - Test templates with different content lengths

