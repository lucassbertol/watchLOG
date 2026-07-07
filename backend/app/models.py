from django.db import models

# Create your models here.

class Series(models.Model):
    COLLECTION_CHOICES = [
        ('backlog', 'Backlog'),
        ('watchLater', 'Watch Later'),
    ]
    
    tmdb_id = models.IntegerField(unique=True, null=True, blank=True)
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    poster_path = models.CharField(max_length=255, blank=True, null=True) 
    status = models.CharField(max_length=20, default='ongoing')
    grade = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)
    dateEnded = models.DateField(blank=True, null=True)
    collection_type = models.CharField(
        max_length=20,
        choices=COLLECTION_CHOICES,
        default='backlog'
    )

    def __str__(self):
        return self.title


class StreamingProvider(models.Model):
    series = models.ForeignKey(
        Series, on_delete=models.CASCADE, related_name='providers'
    )
    provider_id = models.IntegerField()
    provider_name = models.CharField(max_length=100)
    logo_path = models.CharField(max_length=255, blank=True, null=True)
    display_priority = models.IntegerField(default=0)

    class Meta:
        ordering = ['display_priority']
        unique_together = ['series', 'provider_id']

    def __str__(self):
        return f"{self.provider_name} - {self.series.title}"