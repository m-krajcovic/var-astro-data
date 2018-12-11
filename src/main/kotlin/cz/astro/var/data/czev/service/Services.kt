package cz.astro.`var`.data.czev.service

import cz.astro.`var`.data.czev.repository.*
import org.springframework.data.domain.Sort
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.stereotype.Service

/**
 * @author Michal
 * @version 1.0
 * @since 11/19/2018
 */

/**
 * Interface for managing constellation entities
 */
interface ConstellationService {
    fun getAll(): List<ConstellationModel>
}

/**
 * Interface for managing filter bands entities
 */
interface FilterBandService {
    fun getAll(): List<FilterBandModel>
}

/**
 * Interface for managing star observers entities
 */
interface StarObserverService {
    fun getAll(): List<StarObserverModel>
}

/**
 * Interface for managing type entities
 */
interface StarTypeService {
    fun getAll(): List<String>
    fun validateType(type: String): Boolean
}

@Service
class ConstellationServiceImpl(
        private val constellationRepository: ConstellationRepository
) : ConstellationService {
    override fun getAll(): List<ConstellationModel> {
        return constellationRepository.findAll(Sort.by(Constellation::name.name)).map { it.toModel() }
    }
}

@Service
class FilterBandServiceImpl(
        private val filterBandRepository: FilterBandRepository
) : FilterBandService {
    override fun getAll(): List<FilterBandModel> {
        return filterBandRepository.findAll(Sort.by(FilterBand::name.name)).asSequence().map { it.toModel() }.filter { f -> f != null}.map { it!! }.toList()
    }
}

@Service
class StarObserverServiceImpl(
        private val observerRepository: StarObserverRepository
) : StarObserverService {
    override fun getAll(): List<StarObserverModel> {
        return observerRepository.findAll(Sort.by(StarObserver::abbreviation.name)).toModels()
    }
}

@Service
class StarTypeServiceImpl(
        private val typeRepository: StarTypeRepository
) : StarTypeService {
    @PreAuthorize("hasRole('USER')")
    override fun validateType(type: String): Boolean {
        return StarTypeValidatorImpl(typeRepository.findAll().map { it.name }.toSet()).validate(type)
    }

    override fun getAll(): List<String> {
        return typeRepository.findAll().map { it.name }
    }
}
