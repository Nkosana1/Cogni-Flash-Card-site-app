# Database Migration Guide

## Initial Setup

If this is the first time setting up migrations:

```bash
cd backend
flask db init
```

This creates the migrations directory structure.

## Creating Migrations

After making model changes:

```bash
# Create a new migration
flask db migrate -m "Description of your changes"

# This will:
# 1. Detect changes in your models
# 2. Generate migration scripts in migrations/versions/
# 3. Create upgrade() and downgrade() functions
```

## Applying Migrations

```bash
# Apply all pending migrations
flask db upgrade

# Apply to a specific revision
flask db upgrade <revision_id>
```

## Rolling Back Migrations

```bash
# Rollback one migration
flask db downgrade

# Rollback to a specific revision
flask db downgrade <revision_id>
```

## Viewing Migration History

```bash
# Show current revision
flask db current

# Show migration history
flask db history

# Show pending migrations
flask db heads
```

## Migration Best Practices

1. **Always review generated migrations** before applying
2. **Test migrations** on a development database first
3. **Backup your database** before applying migrations in production
4. **Use descriptive migration messages**
5. **One logical change per migration** when possible

## Common Issues

### Issue: "Target database is not up to date"

**Solution**: Apply pending migrations first
```bash
flask db upgrade
```

### Issue: "Can't locate revision identified by 'xxxxx'"

**Solution**: Your database may be out of sync. Check migration history:
```bash
flask db history
flask db current
```

### Issue: Migration conflicts

**Solution**: Resolve conflicts manually in the migration file, or:
```bash
# Merge branches if needed
flask db merge -m "Merge migration branches"
```

## Initial Migration for Comprehensive Models

To create the initial migration for all models:

```bash
# Make sure all models are imported in app/models/__init__.py
# Then create migration
flask db migrate -m "Initial comprehensive models: User, UserPreferences, Deck, Card, CardReview, StudySession"

# Review the generated migration file
# Apply it
flask db upgrade
```

## Model Changes Requiring Migrations

- Adding/removing columns
- Changing column types
- Adding/removing indexes
- Adding/removing foreign keys
- Changing constraints
- Adding/removing tables

## Model Changes NOT Requiring Migrations

- Adding/removing methods
- Changing method implementations
- Adding/removing class attributes (not database columns)
- Changing docstrings

## Production Deployment

1. **Test migrations locally** first
2. **Backup production database**
3. **Apply migrations during maintenance window** if possible
4. **Monitor for errors** during migration
5. **Have rollback plan** ready

```bash
# Production migration checklist
# 1. Backup database
pg_dump neuroflash > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Test migration on staging
flask db upgrade

# 3. Apply to production
flask db upgrade

# 4. Verify application works
# 5. Monitor logs
```
